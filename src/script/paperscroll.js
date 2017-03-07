function hyphenate(str) {
	return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function isVisible(el) {
	if (el.is(':hidden')) return false;
	var viewTop = $(window).scrollTop();
	var viewBottom = viewTop + $(window).height();
	var top = el.offset().top;
	var bottom = top + el.height();
	return top >= viewTop && bottom <= viewBottom 
			|| top <= viewTop && bottom >= viewTop 
			|| top <= viewBottom && bottom >= viewBottom; 
}

function smoothScrollTo(el, callback) {
	$('html, body').animate({
		scrollTop: el.offset().top
	}, 250, callback);
}

var behaviors = {};


behaviors.sections = function() {
	var toc = $('.toc');
	var checks = [];
	var active;

	function update() {
		$.each(checks, function() {
			if (this()) return false;
		});
	}

	$(document).scroll(update);
	$(window).resize(update);
	setTimeout(update, 0);

    $('article section').each(function() {
        var section = $(this);
        var anchor = $('a', section);
        // Move content until next section inside section
        section.append(section.nextUntil('section'));
        var title = anchor.attr('title') || $('h1,h2', section).first().text();
        var id = section.attr('id');
        if (!id) {
            id = hyphenate(title)
                .replace(/\s+/g, '-')
                .replace(/^#/, '')
                .replace(/[!"#$%&'\()*+,.\/:;<=>?@\[\\\]\^_`{|}~]+/g, '-')
                .replace(/-+/g, '-');
            section.attr('id', id);
            anchor.attr('name', id);
        }

        function activate() {
            if (active) active.removeClass('active');
            selector.addClass('active');
            active = selector;
        }

        if (toc) {
            var selector = $('<li><a href="#' + id + '">' + title + '</a></li>').appendTo(toc);
            checks.push(function() {
                var visible = isVisible(section);
                if (visible) activate();
                return visible;
            });
        }
    });
    $('article').delegate('a, h2', 'click', function(e) {
        var section = $(e.target).closest('section');
        smoothScrollTo(section, function() {
            window.location.hash = section.attr('id');
        });
        return false;
    });
    $('.toc').delegate('li a', 'click', function(e) {
        var id = $(e.target).attr('href');
        var section = $(id);
        smoothScrollTo(section, function() {
            window.location.hash = id;
        });
        return false;
    });

    var lastSection = $('article section:last');
    var lastAnchor = $('a[name]', lastSection);

    function resize() {
        lastSection.height('auto');
        var bottom = $(document).height() - lastSection.offset().top - $(window).outerHeight();
        if (bottom < 0) lastSection.height($(window).height());
    }

    if (lastSection.length && lastAnchor.length) {
        $(window).on({
            load: resize,
            resize: resize
        });
        resize();
    }
};

behaviors.hash = function() {
    var hash = unescape(window.location.hash);
    if (hash) {
        var target = $(hash);
        if (target.length) smoothScrollTo(target);
    }
};

$(function() {
    for (var i in behaviors)
        behaviors[i]();
});

