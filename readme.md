# Carve

Install with npm:

```
npm install --global @boyeborg/carve
```

## Usage

```
$ carve --help

  Download npm packages and their dependencies.

  Usage
    $ carve <package-name>... [options]

  Options
    --output, -o    Output directory (default: packages)
    --registry, -r  NPM registry to use (default: https://registry.npmjs.org)
    --help          Displays this help text
    --version       Displays the version number

  Examples
    $ carve meow@5.0.0 react "moment@1||2||3" --output=dump
```
