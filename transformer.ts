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
  const literals: string[] = [];
  node.typeArguments && resolveStringLiteralTypes(typeChecker.getTypeFromTypeNode(node.typeArguments[0]), literals);

  return ts.createObjectLiteral(literals.map(literal =>
    ts.createPropertyAssignment(JSON.stringify(literal), ts.createStringLiteral(literal))
  ));
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
