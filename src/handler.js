const { nanoid } = require('nanoid');
const books = require('./books');


//ini adalah cara untuk add buku
function addBookHandler(request, h) {
    const requestBodyBooks = request.payload;
    if (!requestBodyBooks.name) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. Mohon isi nama buku',
        });
        response.code(400);

        return response;
    }
    if (requestBodyBooks.readPage > requestBodyBooks.pageCount) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
        });
        response.code(400);

        return response;
    }

    const bookId = nanoid(16);
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;
    const newBook = {
        id: bookId,
        name: requestBodyBooks.name,
        year: requestBodyBooks.year,
        author: requestBodyBooks.author,
        summary: requestBodyBooks.summary,
        publisher: requestBodyBooks.publisher,
        pageCount: requestBodyBooks.pageCount,
        readPage: requestBodyBooks.readPage,
        reading: requestBodyBooks.reading,
        finished: requestBodyBooks.pageCount === requestBodyBooks.readPage,
        insertedAt,
        updatedAt,
    };
    books.push(newBook);

    const isSuccess = books.some((book) => book.id === bookId).length > 0;
    if (!isSuccess) {
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil ditambahkan',
            data: {
                bookId,
            },
        });
        response.code(201);

        return response;
    }
    const response = h.response({
        status: 'fail',
        message: 'Buku gagal ditambahkan',
    });
    response.code(500);

    return response;
}

//get buku semuanya
const getBooksHandler = (request, h) => {
    let bodyRes;
    const query = request.query;
    const { name, reading, finished } = query;

    if (name) {
        const array = [];
        for (let i = 0; i < books.length; i++) {
            if (books[i].name.toLowerCase().includes(name.toLowerCase())) {
                const { id, name, publisher } = books[i];
                array.push({ id, name, publisher });
            }
        }
        bodyRes = {
            status: 'success',
            data: {
                books: array,
            },
        };
        return bodyRes;
    }

    if (reading && Number(reading) === 0 || Number(reading) === 1) {// kalo reading ada dan bernilai 0 atau 1, akan dijalankan
        const array = [];
        for (let i = 0; i < books.length; i++) {
            if (books[i].reading == reading) {
                const { id, name, publisher } = books[i];
                array.push({ id, name, publisher });
            }
        }
        bodyRes = {
            status: 'success',
            data: {
                'books': array,
            },
        };
        return bodyRes;
    }

    if (finished && Number(finished) === 0 || Number(finished) === 1) {
        const array = [];
        for (let i = 0; i < books.length; i++) {
            if (books[i].finished == finished) {
                const { id, name, publisher } = books[i];
                array.push({ id, name, publisher });
            }
        }
        bodyRes = {
            status: 'success',
            data: {
                books: array,
            },
        };
        return bodyRes;
    } if (finished && Number(finished) !== 0 && Number(finished) !== 1) {
        const array = [];
        for (let i = 0; i < books.length; i++) {
            array.push(
                { id: books[i].id, name: books[i].name, publisher: books[i].publisher },
            );
        }
        bodyRes = {
            status: 'success',
            data: {
                books: array,
            },
        };
        return bodyRes;
    }

    if (books.length > 0 && !name && !reading && !finished) {// get all tanpa query
        const array = [];
        for (let i = 0; i < books.length; i++) {
            array.push(
                { id: books[i].id, name: books[i].name, publisher: books[i].publisher },
            );
        }
        h = {
            status: 'success',
            data: {
                books: array,
            },
        };
        return h;
    }
    h = {
        status: 'success',
        data: {
            books,
        },
    };
    return h;

};
//get buku berdasarkan id dari handler
const getBookByIdHandler = (request, h) => {
    const { id } = request.params;

    const book = books.filter((z) => z.id === id)[0];

    if (book !== undefined) {
        // Bila buku dengan id yang dilampirkan ditemukan
        const response = h.response({
            status: 'success',
            data: {
                book,
            },
        }).code(200);
        return response;
    }


    const response = h
        .response({
            status: 'fail',
            message: 'Buku tidak ditemukan',
        })
        .code(404);
    return response;
};

//edit buku berdasarkan id dari handler
const editBookByIdHandler = (request, h) => {
    const { id } = request.params;
    const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
    } = request.payload;
    const updatedAt = new Date().toISOString();
    const index = books.findIndex((book) => book.id === id);
    if (index !== -1) {
        if (!name) {
            const response = h.response({
                status: 'fail',
                message: 'Gagal memperbarui buku. Mohon isi nama buku',
            });
            response.code(400);
            return response;
        }
        if (pageCount < readPage) {
            const response = h.response({
                status: 'fail',
                message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
            });
            response.code(400);
            return response;
        }
        const finished = (pageCount === readPage);
        books[index] = {
            ...books[index],
            name,
            year,
            author,
            summary,
            publisher,
            pageCount,
            readPage,
            finished,
            reading,
            updatedAt,
        };
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil diperbarui',
        });
        response.code(200);

        return response;
    }

    const response = h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Id tidak ditemukan',
    });
    response.code(404);

    return response;
};

//delete to book berdasarkan id
const deleteBookByIdHandler = (request, h) => {
    const { id } = request.params;

    const index = books.findIndex((book) => book.id === id);

    if (index !== -1) {
        books.splice(index, 1);
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil dihapus',
        });
        response.code(200);
        return response;
    }

    const response = h.response({
        status: 'fail',
        message: 'Buku gagal dihapus. Id tidak ditemukan',
    });
    response.code(404);

    return response;
};

module.exports = {
    addBookHandler,
    getBooksHandler,
    getBookByIdHandler,
    editBookByIdHandler,
    deleteBookByIdHandler,
};
