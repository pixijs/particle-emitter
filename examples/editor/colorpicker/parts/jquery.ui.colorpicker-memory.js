;jQuery(function($) {	
	$.colorpicker.parts.memory = function (inst) {
		var that		= this,
			container,
			selectNode	= function(node) {
							inst._setColor($(node).css('backgroundColor'));
							inst._change();
						},
			deleteNode	= function(node) {
							node.remove();
						},
			addNode		= function(color) {
							var $node = $('<div/>').addClass('ui-colorpicker-swatch').css('backgroundColor', color);
							$node.mousedown(function(e) {
								e.stopPropagation();
								switch (e.which) {
									case 1:	
										selectNode(this);
										break;
									case 3:
										deleteNode($node);
										setMemory();
										break;
								}
							}).bind('contextmenu', function(e) {
								e.preventDefault();								
							});

							container.append($node);
						},
			getMemory	= function() {
							return (document.cookie.match(/\bcolorpicker-memory=([^;]*)/) || [0, ''])[1].split(',');
						};
			setMemory	= function() {
							var colors = [];
							$('> *', container).each(function() {
								colors.push(escape($(this).css('backgroundColor')));
							});
							var expdate=new Date();
							expdate.setDate(expdate.getDate() + (365 * 10));
							document.cookie = 'colorpicker-memory='+colors.join()+";expires="+expdate.toUTCString();
						};

		this.init = function () {
			container	= $('<div/>')
							.addClass('ui-colorpicker-memory ui-colorpicker-border ui-colorpicker-swatches')
							.css({
								width:		84,
								height:		84,
								cursor:		'crosshair'
							})
							.appendTo($('.ui-colorpicker-memory-container', inst.dialog));

			$.each(getMemory(), function() {
				addNode(unescape(this));
			});

			container.mousedown(function(e) {
				addNode(inst.color.toCSS());
				setMemory();
			});
		};
	};
});