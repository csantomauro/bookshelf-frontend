export type BookResponse = {
    title: string;
    genre: string;
    isbn: string;
    publisher: string;
    publicationYear: number;
    price: number;
    _links: {
        self: {
            href: string;
        },
        book: {
            href: string;
        },
        author: {
            href: string;
        }
    }
}

export type Book = {
    title: string;
    genre: string;
    isbn: string;
    publisher: string;
    publicationYear: number;
    price: number;
}
  
  export type BookEntry = {
    book: Book;
    url: string;
}