const {
    nanoid
} = require('nanoid');
const books = require('./books');

// Handler untuk menambahkan buku baru
const addBookHandler = (request, h) => {
    const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading
    } = request.payload;

    // Validasi: Pastikan properti 'name' ada dalam permintaan (tidak boleh kosong)
    if (!name) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. Mohon isi nama buku'
        });

        response.code(400);
        return response;
    }

    // Validasi: Pastikan nilai 'readPage' tidak melebihi 'pageCount'
    if (readPage > pageCount) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount'
        });

        response.code(400);
        return response;
    }

    const id = nanoid(16);
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;
    const finished = pageCount === readPage;

    const newBook = {
        id,
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished,
        reading,
        insertedAt,
        updatedAt
    };

    books.push(newBook);
    const isSuccess = books.filter((book) => book.id === id).length > 0;

    // Kirim respons sukses jika buku berhasil ditambahkan
    if (isSuccess) {
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil ditambahkan',
            data: {
                bookId: id
            }
        });

        response.code(201);
        return response;
    }

    // Kirim respons gagal jika ada masalah umum saat menambahkan buku
    const response = h.response({
        status: 'fail',
        message: 'Buku gagal ditambahkan'
    });

    response.code(500);
    return response;
};

// Handler untuk mengambil semua buku dengan filter opsional
const getAllBooksHandler = (request, h) => {
    const {
        name,
        reading,
        finished
    } = request.query;

    // Inisialisasi daftar buku yang akan difilter
    let filteredBooks = books;

    // Filter berdasarkan 'name' jika disediakan dalam query
    if (name) {
        filteredBooks = books.filter((book) => book.name.toLowerCase().includes(name.toLowerCase()));
    }

    // Filter berdasarkan status 'reading' jika disediakan dalam query
    if (reading) {
        filteredBooks = books.filter((book) => Number(book.reading) === Number(reading));
    }

    // Filter berdasarkan status 'finished' jika disediakan dalam query
    if (finished) {
        filteredBooks = books.filter((book) => Number(book.finished) === Number(finished));
    }

    // Kirim respons JSON dengan daftar buku yang sudah difilter
    const response = h.response({
        status: 'success',
        data: {
            books: filteredBooks.map((book) => ({
                id: book.id,
                name: book.name,
                publisher: book.publisher
            }))
        }
    });

    response.code(200);
    return response;
};

// Handler untuk mengambil buku berdasarkan ID
const getBookByIdHandler = (request, h) => {
    const {
        id
    } = request.params;

    const book = books.filter((b) => b.id === id)[0];

    // Jika buku ditemukan, kirim respons dengan status 'success' dan data buku
    if (book !== undefined) {
        return {
            status: 'success',
            data: {
                book
            }
        };
    }

    // Jika buku tidak ditemukan, kirim respons dengan status 'fail' dan pesan yang sesuai
    const response = h.response({
        status: 'fail',
        message: 'Buku tidak ditemukan'
    });

    response.code(404);
    return response;
};

// Handler untuk mengedit buku berdasarkan ID
const editBookByIdHandler = (request, h) => {
    const {
        id
    } = request.params;

    const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading
    } = request.payload;

    const updatedAt = new Date().toISOString();
    const index = books.findIndex((book) => book.id === id);

    // Validasi: Pastikan properti 'name' ada dalam payload permintaan
    if (!name) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. Mohon isi nama buku'
        });
        response.code(400);

        return response;
    }

    // Validasi: Pastikan nilai 'readPage' tidak melebihi 'pageCount'
    if (readPage > pageCount) {
        const response = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount'

        });
        response.code(400);

        return response;
    }

    if (index !== -1) {
        const finished = pageCount === readPage;

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
            updatedAt
        };

        // Kirim respons sukses jika buku berhasil diperbarui
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil diperbarui'
        });

        response.code(200);
        return response;
    }

    // Kirim respons gagal jika ID buku tidak ditemukan
    const response = h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Id tidak ditemukan'
    });

    response.code(404);
    return response;
};

// Handler untuk menghapus buku berdasarkan ID
const deleteBookByIdHandler = (request, h) => {
    const {
        id
    } = request.params;

    const index = books.findIndex((note) => note.id === id);

    // Jika ID dimiliki oleh salah satu buku, hapus buku tersebut dan kirim respons sukses
    if (index !== -1) {
        books.splice(index, 1);
        const response = h.response({
            status: 'success',
            message: 'Buku berhasil dihapus'
        });

        response.code(200);
        return response;
    }

    // Jika ID yang dilampirkan tidak dimiliki oleh buku manapun, kirim respons gagal
    const response = h.response({
        status: 'fail',
        message: 'Buku gagal dihapus. Id tidak ditemukan'
    });

    response.code(404);
    return response;
};

module.exports = {
    addBookHandler,
    getAllBooksHandler,
    getBookByIdHandler,
    editBookByIdHandler,
    deleteBookByIdHandler
};