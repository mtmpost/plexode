// Copyright 2006 Aaron Whyte
// All Rights Reserved.

/**
 * @fileoverview
 */
this.plex = this.plex || {};

plex.string = {};

plex.string.REGEXP_ESCAPE_RE_ = /([\{\}\|\^\$\[\]\(\)\.\*\\])/g;

plex.string.AMP_RE_ = /&/g;
plex.string.LT_RE_ = /</g;
plex.string.SQUOT_RE_ = /'/g;
plex.string.DQUOT_RE_ = /"/g;
plex.string.EOLN_RE_ = /\n/g;
plex.string.TWOSPACE_RE_ = /  /g;


/**
 * Backslash-escapes regexp symbols.  Useful for creating regexps that match
 * literal strings.
 * @param {String} text
 * @return {String} a string for passing to the RegExp constructor
 */
plex.string.textToRegExpStr = function(text) {
  return String(text).replace(plex.string.REGEXP_ESCAPE_RE_, '\\$1');
};


/**
 * Converts text to HTML, including double-quotes, but not single-quotes.
 * @param {String} text
 * @param {Boolean} opt_preserveSpaces  if true, nbsp's will replace every
 *     other space in a run of spaces, and br's will replace eolns.
 */
plex.string.textToHtml = function(text, opt_preserveSpaces) {
  var html = String(text).
    replace(plex.string.AMP_RE_, '&amp;').
    replace(plex.string.LT_RE_, '&lt;').
    replace(plex.string.DQUOT_RE_, '&quot;');
  if (opt_preserveSpaces) {
    html = html.
      replace(plex.string.EOLN_RE_, '<br>').
      replace(plex.string.TWOSPACE_RE_, '&nbsp; ');
  }
  return html;
};


/**
 * Converts text to a string that can go between single-quotes in a JS string
 * literal.
 * @param {String} text
 * @param {String} the JS literal, with single-quotes escaped.
 */
plex.string.textToSingleQuoteJsLiteral = function(text) {
  return String(text).
    replace(plex.string.SQUOT_RE_, '\\\'').
    replace(plex.string.EOLN_RE_, '\\n');
};
