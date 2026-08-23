export type BookResponse = {
    title: string;
    genre: string;
    isbn: string;
    publisher: string;
    publicationYear: number;
    price: number;
    coverUrl?: string | null;
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
    coverUrl?: string | null;
}
  
  export type BookEntry = {
    book: Book;
    url: string;
}

export type Review = {
    id: number;
    username: string;
    rating: number;
    text: string | null;
    createdAt: string;
    updatedAt: string | null;
}

export type ReviewRequest = {
    rating: number;
    text: string;
}

export type ReadingStatus = 'WANT_TO_READ' | 'READING' | 'READ';

export type ShelfEntry = {
    id: number;
    bookId: number;
    bookTitle: string;
    bookCoverUrl: string | null;
    status: ReadingStatus;
    addedAt: string;
}
