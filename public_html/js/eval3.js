// Copyright 2009 Aaron Whyte
// All Rights Reserved.

this.plex = this.plex || {};

plex.eval3 = {};

plex.eval3.timerId = null;

plex.eval3.INPUT_IDS = [
  'ht', 'ohh', 'ohj',
  'jt', 'ojh', 'ojj',
  'ms', 'oth', 'otj',
  'cex'
];
                       
plex.eval3.start = function() {
  // Decode URL and fill whitelisted input fields with initial values.
  var map = plex.url.decodeQuery(plex.url.getFragment());
  for (var i = 0; i < plex.eval3.INPUT_IDS.length; i++) {
    var id = plex.eval3.INPUT_IDS[i];
    if (id in map) {
      var input = plex.dom.gebi(id);
      if (input.type == 'checkbox') {
        input.checked = map[id] == '1';
      } else {
        plex.dom.gebi(id).value = map[id];
      }
    }
  }
  
  function taListen(id, handler) {
    var c = new plex.wij.TaChanges();
    c.setElement(plex.dom.gebi(id));
    c.subChange(handler);
  }
  
  function cbListen(id, handler) {
    plex.event.addListener(plex.dom.gebi(id), 'change',
        handler);
  }

  // Listen for HTML and JS textarea changes.
  taListen('jt', plex.eval3.onJsChange);
  taListen('ht', plex.eval3.onHtmlChange);
  
  // Listen for changes to timer control.
  cbListen('oth', plex.eval3.onTimerControlChange);
  cbListen('otj', plex.eval3.onTimerControlChange);
  taListen('ms', plex.eval3.onTimerControlChange);

  // Listen for other checkbox changes, for saving.
  cbListen('ohh', plex.eval3.save);
  cbListen('ohj', plex.eval3.save);
  cbListen('ojh', plex.eval3.save);
  cbListen('ojj', plex.eval3.save);
  
  // Immediately eval if any onchange boxes are checked.
  plex.eval3.eval(
      plex.dom.gebi('ohh').checked || plex.dom.gebi('ojh').checked,
      plex.dom.gebi('ohj').checked || plex.dom.gebi('ojj').checked);
  
  // Maybe start timer.
  plex.eval3.resetTimer();
  
};

plex.eval3.onTimerControlChange = function() {
  plex.eval3.save();
  plex.eval3.resetTimer();
};

plex.eval3.resetTimer = function() {
  if (plex.eval3.timerId) {
    clearTimeout(plex.eval3.timerId);
    plex.eval3.timerId = 0;
  }
  var th = plex.dom.gebi('oth').checked;
  var tj = plex.dom.gebi('otj').checked;
  if (th || tj) {
    var ms = parseInt(plex.dom.gebi('ms').value);
    if (ms && ms > 0) {
      plex.eval3.timerId = setTimeout(plex.eval3.onTimeout, ms);
    }
  }
};

plex.eval3.onTimeout = function() {
  // Start the timer again, after the eval, even if there's an exception.
  setTimeout(plex.eval3.resetTimer, 0);
  plex.eval3.eval(plex.dom.gebi('oth').checked, plex.dom.gebi('otj').checked);
};

plex.eval3.onHtmlChange = function() {
  plex.eval3.save();
  plex.eval3.eval(plex.dom.gebi('ohh').checked, plex.dom.gebi('ohj').checked);
};

plex.eval3.onJsChange = function() {
  plex.eval3.save();
  plex.eval3.eval(plex.dom.gebi('ojh').checked, plex.dom.gebi('ojj').checked);
};

plex.eval3.eval = function(doHtml, doJs) {
  if (doHtml) plex.eval3.evalHtml();
  if (doJs) plex_eval3_evalJs();
};

plex.eval3.evalHtml = function() {
  plex.dom.gebi('hd').innerHTML = plex.dom.gebi('ht').value;
};

/**
 * This is a function of the window, so 'this' will evaluate to the window
 * like it should, and not to plex.eval3.
 */
plex_eval3_evalJs = function() {
  var expr = plex.dom.gebi('jt').value;
  var out = plex.dom.gebi('jd');
  var catchExceptions = plex.dom.gebi('cex').checked;
  if (catchExceptions) {
    try {
      out.innerHTML = plex.string.textToHtml(String(eval(expr)), true);
    } catch (e) {
      out.innerHTML =
          '<div style="color:red">Error:</div>' +
          plex.string.textToHtml(plex.object.expose(e), '<br>');
    }
  } else {
    out.innerHTML = plex.string.textToHtml(String(eval(expr)), true);
  }
};

plex.eval3.save = function() {
  var map = {};
  for (var i = 0; i < plex.eval3.INPUT_IDS.length; i++) {
    var id = plex.eval3.INPUT_IDS[i];
    var input = plex.dom.gebi(id);
    if (input.type == 'checkbox') {
      map[id] = input.checked ? 1 : 0;
    } else {
      map[id] = plex.dom.gebi(id).value;
    }
  }
  var q = plex.url.encodeQuery(map);
  plex.url.setFragment(q);
};

