function debounce(func, wait) {
    return () => {
        let args = arguments
        if (this.timeout != null) {
            clearTimeout(this.timeout)
            this.timeout = null
        }
        this.timeout = setTimeout(() => {
            this.timeout = null
            func.apply(args)
        }, wait)
    }
}

class SearchBox {
    constructor(index, inputNode) {
        this.index = index

        this.inputNode = inputNode
        this.inputNode.addEventListener('input', debounce((event) => {
            this.update()
        }, 250))

        this.resultsNode = document.createElement('div')
        this.resultsNode.id = 'search-results'
        this.inputNode.parentNode.insertBefore(this.resultsNode, this.inputNode.nextSibling)

        this.update()
    }

    update() {
        let results = this.index.search(this.inputNode.value, {expand: true})
        while (this.resultsNode.firstChild) {
            this.resultsNode.removeChild(this.resultsNode.firstChild)
        }
        for (let result of results) {
            // remove index page from search
            // it can't be excluded from the search index normally so just do it here
            if (result.ref == window.location.protocol + "//" + window.location.host + "/") {
                continue
            }

            let resultTextNode = document.createTextNode(result.doc.title)

            let resultLinkNode = document.createElement('a')
            resultLinkNode.href = result.ref
            resultLinkNode.appendChild(resultTextNode)

            let resultNode = document.createElement('a')
            resultNode.href = result.ref
            resultNode.appendChild(resultLinkNode)

            this.resultsNode.appendChild(resultNode)
        }
    }
}

window.onload = () => {
    const index = elasticlunr.Index.load(window.searchIndex)
    new SearchBox(index, document.getElementById('search-input')) 
}