import * as ts from 'typescript';
import * as path from 'path';

export default function transformer(program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => (file: ts.SourceFile) => visitNodeAndChildren(file, program, context);
}

function visitNodeAndChildren(node: ts.SourceFile, program: ts.Program, context: ts.TransformationContext): ts.SourceFile;
function visitNodeAndChildren(node: ts.Node, program: ts.Program, context: ts.TransformationContext): ts.Node | undefined;
function visitNodeAndChildren(node: ts.Node, program: ts.Program, context: ts.TransformationContext): ts.Node | undefined {
  return ts.visitEachChild(visitNode(node, program), childNode => visitNodeAndChildren(childNode, program, context), context);
}

function visitNode(node: ts.SourceFile, program: ts.Program): ts.SourceFile;
function visitNode(node: ts.Node, program: ts.Program): ts.Node | undefined;
function visitNode(node: ts.Node, program: ts.Program): ts.Node | undefined {
  const typeChecker = program.getTypeChecker();
  if (isEnumerateImportExpression(node)) {
    return;
  }
  if (!isEnumerateCallExpression(node, typeChecker)) {
    return node;
  }
  const literals: string[] = [];
  node.typeArguments && resolveStringLiteralTypes(typeChecker.getTypeFromTypeNode(node.typeArguments[0]), literals);

  return ts.createObjectLiteral(literals.map(literal =>
    ts.createPropertyAssignment(JSON.stringify(literal), ts.createStringLiteral(literal))
  ));
}

const indexJs = path.join(__dirname, 'index.js');
function isEnumerateImportExpression(node: ts.Node): node is ts.ImportDeclaration {
  if (!ts.isImportDeclaration(node)) {
    return false;
  }
  const module = (node.moduleSpecifier as ts.StringLiteral).text;
  try {
    return indexJs === (
      module.startsWith('.')
        ? require.resolve(path.resolve(path.dirname(node.getSourceFile().fileName), module))
        : require.resolve(module)
    );
  } catch(e) {
    return false;
  }
}

const indexTs = path.join(__dirname, 'index.d.ts');
function isEnumerateCallExpression(node: ts.Node, typeChecker: ts.TypeChecker): node is ts.CallExpression {
  if (!ts.isCallExpression(node)) {
    return false;
  }
  const signature = typeChecker.getResolvedSignature(node);

  if (typeof signature === 'undefined') {
    return false;
  }

  const { declaration } = signature;

  return !!declaration
    && !ts.isJSDocSignature(declaration)
    && path.join(declaration.getSourceFile().fileName) === indexTs
    && !!declaration.name
    && declaration.name.getText() === 'enumerate';
}

function resolveStringLiteralTypes(type: ts.Type, literals: string[]) {
  if (type.isUnion()) {
    type.types.forEach(type => resolveStringLiteralTypes(type, literals));
  } else if (type.isStringLiteral()) {
    literals.push(type.value);
  }
}
