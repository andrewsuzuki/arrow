(function($){
	
	var defaults = {
		id: 'message',
		name: 'message',
		allowed: ['p','a','img']
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

			console.log(input);
			
			el.append(input);
			methods.setSettings(el, {input: input});
			el.attr('contenteditable', true).css('overflow', 'auto');
		},
		binds: function(el) {
			el.on('focus keyup paste blur', function() {
				setTimeout(function() {
					methods.update(el);
				}, 100);
			});

			el.closest('form').on('submit', function(e) {
				methods.update(el);
			});
		},
		update: function(el) {
			console.log('update called');
			ta = el.find('textarea').clone();
			el.find('textarea').remove();
			stuff = el.html();
			// process html here
			ta.html(stuff);
			el.append(ta);
		}
	};

	$.fn.arrow = function(method) {
		var args = arguments;
		var $this = this;
        return this.each(function() {
            if (methods[method]) {
                return methods[method].apply($this, Array.prototype.slice.call(args, 1));
            } else if (typeof method === 'object' || !method) {
                return methods.init.apply($this, Array.prototype.slice.call(args, 0));
            } else {
                $.error('Method ' +  method + ' does not exist on jQuery.arrow');
            }  
        });
	};

})(jQuery);