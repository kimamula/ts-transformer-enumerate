import * as ts from 'typescript';
import * as path from 'path';

export default function transformer(program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => (file: ts.SourceFile) => visitNodeAndChildren(file, program, context);
}

function visitNodeAndChildren(node: ts.SourceFile, program: ts.Program, context: ts.TransformationContext): ts.SourceFile;
function visitNodeAndChildren(node: ts.Node, program: ts.Program, context: ts.TransformationContext): ts.Node;
function visitNodeAndChildren(node: ts.Node, program: ts.Program, context: ts.TransformationContext): ts.Node {
  return ts.visitEachChild(visitNode(node, program), childNode => visitNodeAndChildren(childNode, program, context), context);
}

function visitNode(node: ts.Node, program: ts.Program): ts.Node {
  const typeChecker = program.getTypeChecker();
  if (!isEnumerateCallExpression(node, typeChecker)) {
    return node;
  }
  const literals: ts.LiteralTypeNode['literal'][] = [];
  node.typeArguments && resolveStringLiteralTypes(node.typeArguments[0], typeChecker, literals);

  return ts.createObjectLiteral(literals.map(literal =>
    ts.createPropertyAssignment(literal.getText(), literal)
  ));
}

const indexTs = path.join(__dirname, 'index.ts');
function isEnumerateCallExpression(node: ts.Node, typeChecker: ts.TypeChecker): node is ts.CallExpression {
  if (node.kind !== ts.SyntaxKind.CallExpression) {
    return false;
  }
  const signature = typeChecker.getResolvedSignature(node as ts.CallExpression);
  if (typeof signature === 'undefined') {
    return false;
  }
  const { declaration } = signature;
  return !!declaration
    && (declaration.getSourceFile().fileName === indexTs)
    && !!(declaration as any)['name']
    && ((declaration as any)['name'].getText() === 'enumerate');
}

function resolveStringLiteralTypes(node: ts.Node, typeChecker: ts.TypeChecker, literals: ts.LiteralTypeNode['literal'][]): void {
  switch (node.kind) {
    case ts.SyntaxKind.TypeReference:
      const symbol = typeChecker.getSymbolAtLocation((node as ts.TypeReferenceNode).typeName);
      symbol && symbol.declarations && symbol.declarations[0].forEachChild(node => resolveStringLiteralTypes(node, typeChecker, literals));
      break;
    case ts.SyntaxKind.UnionType:
      node.forEachChild(node => resolveStringLiteralTypes(node, typeChecker, literals));
      break;
    case ts.SyntaxKind.LiteralType:
      const literal = (node as ts.LiteralTypeNode).literal;
      // collect literal instead of string
      !literals.some(_literal => _literal.getText() === literal.getText()) && literals.push(literal);
      break;
    default:
      break;
  }
}
