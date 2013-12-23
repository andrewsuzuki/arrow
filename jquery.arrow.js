(function($){

	var entityMap = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': '&quot;',
		"'": '&#39;',
		"/": '&#x2F;'
	};
	
	var defaults = {
		id: 'message',
		name: 'message',
		allowed: ['p','a','img','br']
	};
	
	var methods = {
		init: function(settings, els) {
			return this.each(function() {
					methods.setSettings($(this));
					methods.setUnique($(this));
					methods.build($(this));
					methods.binds($(this));
					methods.update($(this));
				}
			)
		},
		setSettings: function(el, extra) {
			var settings = el.data('settings');
			settings = $.extend(true, {}, defaults, settings, extra);
			if (el.data('arrowid')) {settings = $.extend(true, {}, settings, {id: el.data('arrowid')});}
			if (el.data('arrowname')) {settings = $.extend(true, {}, settings, {name: el.data('arrowname')});}
			el.data('settings', settings);
		},
		getSetting: function(el, key) {
			var settings = el.data('settings');
			if (settings[key]) return settings[key];
			return false;
		},
		setUnique: function(el) {
			methods.setSettings(el, {unique: Math.ceil(Math.random() * Math.random() * Math.random() * 1000000000)});
		},
		build: function(el) {
			// Todo: add support for non-ce, like element.contentEditable != null

			var input = $('<textarea></textarea>');
			input.css({
				'width': 0,
				'height': 0,
				'display': 'none'
			});

			if (methods.getSetting(el, 'id')) {   input.attr('id',   methods.getSetting(el, 'id')); };
			if (methods.getSetting(el, 'name')) { input.attr('name', methods.getSetting(el, 'name')); };
			
			el.append(input);
			methods.setSettings(el, {input: input});
			el.attr('contenteditable', true).css('overflow', 'auto');
		},
		binds: function(el) {
			el.on('focus keypress paste blur', function() {
				// Timeout needed for paste event lag
				setTimeout(function() {
					methods.update(el);
				}, 100);
			});

			el.on('keypress', function(e) {
				if (e.which == 13) {
					// Enter was pressed
					methods.insertHtmlAtCaret('<br>');
					return false;
				}
		    });

			el.closest('form').on('submit', function(e) {
				methods.update(el);
			});
		},
		update: function(el) {
			console.log('Updating textarea...');
			ta = el.find('textarea').clone();
			el.find('textarea').remove();
			// process html here
			pre = el.html();
			if (pre.slice('-4') != '<br>' && pre.slice('-5') != '<br/>' && pre.slice('-6') != '<br />') {
				el.append('<br>');
			}

			white = methods.getSetting(el, 'allowed');
			white = white.join(', ');
			el.find(':not('+white+')').contents().unwrap();
			el.find(':not('+white+')').remove();

			// strip inline styles, then delete empty elements...we strict 'bout dis!
			el.find('*').removeAttr('style').filter(function() {
				return $(this).is(':empty') && /^(?:area|br|col|embed|hr|img|input|link|meta|param)$/i.test($(this))
			}).remove();

			// end process
			stuff = el.html();
			stuff = methods.convertEntities(stuff);
			ta.html(stuff);
			el.append(ta);
			return stuff;
		},
		val: function(el) {
			// clone of update(), for api
			return methods.update(el);
		},
		convertEntities: function(string) {
			return String(string).replace(/[&<>"'\/]/g, function (s) {
				return entityMap[s];
			});
		},
		getSelectionHtml: function() {
			var html = "";
			if (typeof window.getSelection != "undefined") {
				var sel = window.getSelection();
				if (sel.rangeCount) {
					var container = document.createElement("div");
					for (var i = 0, len = sel.rangeCount; i < len; ++i) {
						container.appendChild(sel.getRangeAt(i).cloneContents());
					}
					html = container.innerHTML;
				}
			} else if (typeof document.selection != "undefined") {
				if (document.selection.type == "Text") {
					html = document.selection.createRange().htmlText;
				}
			}
			return html;
		},
		insertHtmlAtCaret: function(html) {
			var sel, range;
			if (window.getSelection) {
				// IE9 and non-IE
				sel = window.getSelection();
				if (sel.getRangeAt && sel.rangeCount) {
					range = sel.getRangeAt(0);
					range.deleteContents();

					// Range.createContextualFragment() would be useful here but is
					// only relatively recently standardized and is not supported in
					// some browsers (IE9, for one)
					var el = document.createElement("div");
					el.innerHTML = html;
					var frag = document.createDocumentFragment(), node, lastNode;
					while ( (node = el.firstChild) ) {
						lastNode = frag.appendChild(node);
					}
					range.insertNode(frag);

					// Preserve the selection
					if (lastNode) {
						range = range.cloneRange();
						range.setStartAfter(lastNode);
						range.collapse(true);
						sel.removeAllRanges();
						sel.addRange(range);
					}
				}
			} else if (document.selection && document.selection.type != "Control") {
				// IE < 9
				document.selection.createRange().pasteHTML(html);
			}
		},
		makeLink: function(href) {
			selected = methods.getSelectionHtml();
			if (selected.length) {
				href = (href === 'undefined' ? "#" : href);
				methods.insertHtmlAtCaret('<a href="'+href+'">'+selected+'</a>');
			}
		},
		makeImage: function(src) {
			methods.insertHtmlAtCaret('<img src="'+src+'" alt="" />');
		},
		doCommand: function(command, value) {
			execCommand(command, false, value);
			// maybe continue this later...
		},

		/* TESTING METHODS */

		imagetest: function() {
			src = prompt('image src:', 'http://');
			methods.makeImage(src);
		},
		linktest: function() {
			href = prompt('link url:', 'http://');
			methods.makeLink(href);
		}

	};

	$.fn.arrow = function(method) {
		var args = arguments;
		var $this = this;
		return this.each(function() {
			if (methods[method]) {
				console.log('API: Called ' + method);
				return methods[method].apply($this, Array.prototype.slice.call(args, 1));
			} else if (typeof method === 'object' || !method) {
				return methods.init.apply($this, Array.prototype.slice.call(args, 0));
			} else {
				$.error('Method ' +  method + ' does not exist on jQuery.arrow');
			}  
		});
	};

})(jQuery);