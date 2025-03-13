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
    
    /**
     * Generates IDs for all articles without an ID, by taking the first 25 
     * characters of the text inside the blockquote and slugifying it.
     * @return {undefined}
     */
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
        clearRandomPick();

        const valueSortByAphorism = 'aphorism';
        const valueSortByAuthor = 'author';
        const value = this.getAttribute('data-sort-by') || valueSortByAphorism;
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

    /**
     * Randomly selects an article to display while hiding others. 
     * Ensures that all articles are picked before repeating any.
     * Clears past picks when all articles have been picked.
     */
    function pickRandom(){
        const articles = [].slice.call(document.querySelectorAll('article'));
        if (!articles.length) { return }

        let pastRandomPicks = getPastRandomPicks();
        if (pastRandomPicks.length === articles.length) {
            clearPastRandomPicks();
            pastRandomPicks = [];
        }
        const randomIndex = getRandomWithExclusion(0, articles.length - 1, pastRandomPicks);
        hideElementsExcept(randomIndex);

        storeRandomPick(randomIndex);
    }

    /**
     * Generates a random number between start and end, excluding the values in
     * the exclude array.
     * Thanks to https://stackoverflow.com/questions/6443176/how-can-i-generate-a-random-number-within-a-range-but-exclude-some
     * @param {number} start - the start of the range
     * @param {number} end - the end of the range
     * @param {number[]} exclude - the values to exclude from the range
     * @return {number} the random number
     */
    function getRandomWithExclusion(start, end, exclude) {
        const max = end - start + 1 - exclude.length;
        let random = Math.floor(Math.random() * max);
        for (let i = 0; i < exclude.length; i++) {
            const ex = exclude[i];
            if (random < ex) {
                break;
            }
            random++;
        }
        return random;
    }

    function hideElementsExcept(randomIndex){
        let style = document.head.querySelector('style#random-aphorism');
        if (!style) {
            style = document.createElement('style');
            style.id = 'random-aphorism';
            document.head.appendChild(style);
        }
        const styleSheet = style.sheet;
        // show all again unless it's the 1st random pick
        if (styleSheet.rules.length) {
            styleSheet.deleteRule(0);
        }

        // calculate the index of the article to show, the rest is hidden
        const buttonsCount = 2;
        const index = buttonsCount + randomIndex + 1;
        styleSheet.insertRule('article:not(:nth-child(' + index + ')) { display: none; }', 0);
    }

    function clearRandomPick(){
        const style = document.head.querySelector('style#random-aphorism');
        if (!style) { return }

        const styleSheet = style.sheet;
        if (styleSheet.rules.length) {
            styleSheet.deleteRule(0);
        }
    }

    const pickedAphorismsKey = 'picked-aphorisms';
    function storeRandomPick(index){
         const storedIndexes = localStorage.getItem(pickedAphorismsKey);
        let indexes;
        if (!storedIndexes) {
            indexes = [index];
        }
        else {
            indexes = JSON.parse(storedIndexes);
            // keep indexes sorted ascending
            const position = sortedIndex(indexes, index);
            indexes.splice(position, 0, index);
        }

        const indexesToStore = JSON.stringify(indexes);
        try {
            localStorage.setItem(pickedAphorismsKey, indexesToStore);
        }
        catch (e) {
            console.error('failed to store random picks, you may happen to pick the same aphorism multiple times, sorry');
        }
    }

    // thanks to https://stackoverflow.com/questions/1344500/efficient-way-to-insert-a-number-into-a-sorted-array-of-numbers
    function sortedIndex(array, value) {
        var low = 0,
            high = array.length;
    
        while (low < high) {
            var mid = low + high >>> 1;
            if (array[mid] < value) low = mid + 1;
            else high = mid;
        }
        return low;
    }
    

    function getPastRandomPicks(){
        const storedIndexes = localStorage.getItem(pickedAphorismsKey);
        if (!storedIndexes) { return [] }

        return JSON.parse(storedIndexes);
    }

    function clearPastRandomPicks(){
        localStorage.removeItem(pickedAphorismsKey);
    }

    window.onload = function(){
        const sortButton = document.getElementById('sort-by');
        if (sortButton) {
            sortButton.addEventListener('click', toggleSorting, false);
        }

        const randomPickButton = document.getElementById('pick-random');
        randomPickButton.addEventListener('click', pickRandom, false);
    }
    window.generateIds = generateIds;
})()