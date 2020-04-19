(function(){
    // polyfill
    if (!String.prototype.trim) {
      String.prototype.trim = function () {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
      };
    }
    
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

        articles.forEach(function(a){
            var text = a.querySelector('blockquote').textContent,
                slug = toSlug(text).substring(0,25).replace(/-$/, ''); // replace dash at the end
            
            a.setAttribute('id', slug);
        })
    }
    
    function sortBy(selector){
        function sortByKey(a, b){
            //console.log(a.key)
            return a.key.localeCompare(b.key);
        }
        var articles = [].slice.call(document.querySelectorAll('article'));
        if (!articles.length) { return }
        
        var parent = articles[0].parentNode;
        var articlesData = articles.map(function(article){
            return {
                key: article.querySelector(selector).textContent.trim(),
                article: article
            }
        })
        articlesData.sort(sortByKey)
        articlesData.forEach(function(data){
            data.article.parentNode.removeChild(data.article);
            parent.appendChild(data.article);
        })
    }
    function sortByAuthor(){
        sortBy('footer');
    }
    function sortByAphorism(){
        sortBy('blockquote');
    }
    function toggleSorting(e){
        var valueSortByAphorism = 'aphorism';
        var valueSortByAuthor = 'author';
        var value = this.getAttribute('data-sort-by') || valueSortByAphorism;
        if (value === valueSortByAphorism) {
            sortBy('footer'); // footer contains the author
            this.setAttribute('data-sort-by', valueSortByAuthor);
            this.textContent = 'sort by aphorism';
        }
        else {
            sortBy('blockquote');
            this.setAttribute('data-sort-by', valueSortByAphorism);
            this.textContent = 'sort by author';
        }
    }

    window.onload = function(){
        var sortButton = document.getElementById('sort-by');
        if (sortButton) {
            sortButton.addEventListener('click', toggleSorting, false);
        }
    }
    window.generateIds = generateIds;
})()