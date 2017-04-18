import * as ts from 'typescript';
import * as path from 'path';

export function createFactory(program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => (file: ts.SourceFile) => visitNodeAndChildren(file, program, context);
}

function visitNodeAndChildren(node: ts.SourceFile, program: ts.Program, context: ts.TransformationContext): ts.SourceFile;
function visitNodeAndChildren(node: ts.Node, program: ts.Program, context: ts.TransformationContext): ts.Node;
function visitNodeAndChildren(node: ts.Node, program: ts.Program, context: ts.TransformationContext): ts.Node {
  return ts.visitEachChild(visitNode(node, program), childNode => visitNodeAndChildren(childNode, program, context), context);
}

function visitNode(node: ts.Node, program: ts.Program) {
  const typeChecker = program.getTypeChecker();
  if (!isEnumerateCallExpression(node, typeChecker)) {
    return node;
  }
  const stringLiteralTypes: string[] = [];
  const { typeArguments } = node;
  const asIndexSignature = typeArguments ? resolveStringLiteralTypes(typeArguments[0], typeChecker, stringLiteralTypes) : true;

  const objectLiteral = ts.createObjectLiteral(stringLiteralTypes.map(stringLiteralType => {
    // unquote string literal type
    const propertyName = stringLiteralType.substring(1, stringLiteralType.length - 1);
    return ts.createPropertyAssignment(propertyName, ts.createLiteral(propertyName));
  }));

  return asIndexSignature
    ? ts.createAsExpression(objectLiteral, ts.createTypeLiteralNode([
      ts.createIndexSignatureDeclaration(
        void 0,
        void 0,
        [ts.createParameter(void 0, void 0, void 0, 'key', void 0, ts.createTypeReferenceNode('string', void 0), void 0)],
        ts.createTypeReferenceNode('string', void 0)
      )
    ]))
    : objectLiteral;
}

function isEnumerateCallExpression(node: ts.Node, typeChecker: ts.TypeChecker): node is ts.CallExpression {
  if (node.kind !== ts.SyntaxKind.CallExpression) {
    return false;
  }
  const { declaration } = typeChecker.getResolvedSignature(node as ts.CallExpression);
  return !!declaration
    && (declaration.getSourceFile().fileName === path.resolve(__dirname, '..', 'index.d.ts'))
    && !!declaration.name
    && (declaration.name.getText() === 'enumerate');
}

function resolveStringLiteralTypes(node: ts.Node, typeChecker: ts.TypeChecker, stringLiteralTypes: string[]): boolean {
  let result = false;
  switch (node.kind) {
    case ts.SyntaxKind.TypeReference:
      const symbol = typeChecker.getSymbolAtLocation((node as ts.TypeReferenceNode).typeName);
      symbol.declarations && symbol.declarations[0].forEachChild(node => result = resolveStringLiteralTypes(node, typeChecker, stringLiteralTypes) || result);
      return result;
    case ts.SyntaxKind.UnionType:
      node.forEachChild(node => result = resolveStringLiteralTypes(node, typeChecker, stringLiteralTypes) || result);
      return result;
    case ts.SyntaxKind.LiteralType:
      stringLiteralTypes.push((node as ts.LiteralTypeNode).getText());
      return false;
    default:
      return true;
  }
}
