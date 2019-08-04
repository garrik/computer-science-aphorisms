(function(){
    function toSlug (str) {
        str = str.replace(/^\s+|\s+$/g, ''); // trim
        str = str.toLowerCase();
      
        // remove accents, swap ñ for n, etc
        var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
        var to   = "aaaaeeeeiiiioooouuuunc------";
        for (var i=0, l=from.length ; i<l ; i++) {
            str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
        }

        str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
            .replace(/\s+/g, '-') // collapse whitespace and replace by -
            .replace(/-+/g, '-'); // collapse dashes

        return str;
    }
    
    function generateIds(){
        var articles = [].slice.call(document.querySelectorAll('article'));

        articles = articles.filter(function(a){ return !a.getAttribute('id'); });

        var items = articles.forEach(function(a){
            var text = a.querySelector('blockquote').textContent,
                slug = toSlug(text).substring(0,25).replace(/-$/, ''); // replace dash at the end
            
            a.setAttribute('id', slug);
        })
    }
    
    window.generateIds = generateIds;
})()