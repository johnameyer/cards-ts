import { strings } from '@angular-devkit/core';
import { dasherize } from '@angular-devkit/core/src/utils/strings';
import { apply, mergeWith, move, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import { Schema } from './schema';


// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function cardGame(_options: Schema): Rule {
  return (tree: Tree, _context: SchematicContext) => {

    const source = url('./files');

    const sourceParameterizedTemplates = apply(source, [
      template({
        ..._options,
        ...strings
      }),
      move('packages/' + dasherize(_options.name))
    ])

    return mergeWith(sourceParameterizedTemplates)(tree, _context);

    return tree;
  };
}
