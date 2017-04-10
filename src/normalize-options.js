import invariant from "invariant";
import builtInsList from "../data/built-ins.json";
import { defaultWebIncludes } from "./default-includes";
import moduleTransformations from "./module-transformations";
import pluginFeatures from "../data/plugin-features";

const validIncludesAndExcludes = [
  ...Object.keys(pluginFeatures),
  ...Object.keys(moduleTransformations).map(m => moduleTransformations[m]),
  ...Object.keys(builtInsList),
  ...defaultWebIncludes,
];

export const validateIncludesAndExcludes = (opts = [], type) => {
  invariant(
    Array.isArray(opts),
    `Invalid Option: The '${type}' option must be an Array<String> of plugins/built-ins`,
  );

  const unknownOpts = [];
  opts.forEach(opt => {
    if (validIncludesAndExcludes.indexOf(opt) === -1) {
      unknownOpts.push(opt);
    }
  });

  invariant(
    unknownOpts.length === 0,
    `Invalid Option: The plugins/built-ins '${unknownOpts}' passed to the '${type}' option are not
    valid. Please check data/[plugin-features|built-in-features].js in babel-preset-env`,
  );

  return opts;
};

export const checkDuplicateIncludeExcludes = (include = [], exclude = []) => {
  const duplicates = include.filter(opt => exclude.indexOf(opt) >= 0);

  invariant(
    duplicates.length === 0,
    `Invalid Option: The plugins/built-ins '${duplicates}' were found in both the "include" and
    "exclude" options.`,
  );
};

export const validateBoolOption = (name, value, defaultValue) => {
  if (typeof value === "undefined") {
    value = defaultValue;
  }

  if (typeof value !== "boolean") {
    throw new Error(`Preset env: '${name}' option must be a boolean.`);
  }

  return value;
};

export const validateLooseOption = looseOpt =>
  validateBoolOption("loose", looseOpt, false);

export const validateUseSyntaxOption = useSyntax =>
  validateBoolOption("useSyntax", useSyntax, true);

export const validateModulesOption = (modulesOpt = "commonjs") => {
  invariant(
    modulesOpt === false ||
      Object.keys(moduleTransformations).indexOf(modulesOpt) > -1,
    `Invalid Option: The 'modules' option must be either 'false' to indicate no modules, or a
    module type which can be be one of: 'commonjs' (default), 'amd', 'umd', 'systemjs'.`,
  );

  return modulesOpt;
};

export const validateUseBuiltInsOption = (builtInsOpt = true) => {
  invariant(
    builtInsOpt === true || builtInsOpt === false || builtInsOpt === "entry",
    `Invalid Option: The 'useBuiltIns' option must be either
    'false' to indicate no polyfill,
    '"entry"' to indicate replacing the entry polyfill, or
    'true' (default) to import only used polyfills per file`,
  );

  return builtInsOpt;
};

export default function normalizeOptions(opts) {
  checkDuplicateIncludeExcludes(opts.include, opts.exclude);

  return {
    debug: opts.debug,
    exclude: validateIncludesAndExcludes(opts.exclude, "exclude"),
    include: validateIncludesAndExcludes(opts.include, "include"),
    loose: validateLooseOption(opts.loose),
    moduleType: validateModulesOption(opts.modules),
    targets: opts.targets,
    useBuiltIns: validateUseBuiltInsOption(opts.useBuiltIns),
    useSyntax: validateUseSyntaxOption(opts.useSyntax),
  };
}
