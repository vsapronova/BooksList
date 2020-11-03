async function listBooks(search, page) {
    let response = await fetch(`/search?search=${search}&page=${page}`, { method: "GET" })
    if (response.status === 200) {
        let json = await response.json()
        return json
    } else {
        let json = await response.json()
        throw json
    }
}

var app = new Vue({
    el: "#app",
    data: {
        search: "",
        books: null,
        page: 1,
        pagination: null,
        error: null,
        loading: false
    },
    methods: {
        async loadBooks() {
            this.error = null
            this.books = null
            this.pagination = null
            this.loading = true

            try {
                let json = await listBooks(this.search, this.page)
                this.books = json.books
                this.pagination = {
                    totalBooks: json.metadata.totalBooks,
                    startBook: json.metadata.startBook,
                    endBook: json.metadata.endBook,
                    totalPages: Math.ceil(json.metadata.totalBooks / json.metadata.pageSize)
                }
            } catch (err) {
                this.error = err.message
            }
            this.loading = false
        },
        doSearch() {
            this.page = 1
            this.loadBooks()
        },
        pagePrev() {
            this.page = this.page-1
            this.loadBooks()

        },
        pageNext() {
            this.page = this.page+1
            this.loadBooks()

        }
    }
})