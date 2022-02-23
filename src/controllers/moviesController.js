const path = require('path');
const db = require('../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");


//Aqui tienen una forma de llamar a cada uno de los modelos
// const {Movies,Genres,Actor} = require('../database/models');

//Aquí tienen otra forma de llamar a los modelos creados
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;


const moviesController = {
    'list': (req, res) => {
        db.Movie.findAll()
            .then(movies => {
                res.render('moviesList.ejs', {movies})
            })
    },
    'detail': (req, res) => {
        db.Movie.findByPk(req.params.id)
            .then(movie => {
                res.render('moviesDetail.ejs', {movie});
            });
    },
    'new': (req, res) => {
        db.Movie.findAll({
            order : [
                ['release_date', 'DESC']
            ],
            limit: 5
        })
            .then(movies => {
                res.render('newestMovies', {movies});
            });
    },
    'recomended': (req, res) => {
        db.Movie.findAll({
            where: {
                rating: {[db.Sequelize.Op.gte] : 8}
            },
            order: [
                ['rating', 'DESC']
            ]
        })
            .then(movies => {
                res.render('recommendedMovies.ejs', {movies});
            });
    },
    //Aqui dispongo las rutas para trabajar con el CRUD
    add: function (req, res) {
        db.Movie.findAll()
      .then((movies) => {
        res.render("moviesAdd", { movies , user: req.session.userLogged});
      })
      .catch((err) => {
        res.send(err);
      });
    },
    create: function (req,res) {
        let resultadoValidacionProduct = validationResult(req);
        if (!resultadoValidacionProduct.errors.length) {
          db.Movie.create({
            nombre: req.body.name,
            precio: req.body.price,
            descuento: req.body.discount,
            imagen: req.file.filename,
            descripcion: req.body.description,
            generos_id: req.body.genre,
          })
            .then((user) => {
              res.redirect("/");
            })
            .catch((err) => {
              res.send(err);
            });
        } else {
          return res.render("moviesAdd", {
            errors: resultadoValidacionProduct.mapped(),
            oldData: req.body,
            user: req.session.userLogged
          });
        }
    },
    edit: function(req,res) {
        const id = req.params.id;
        db.Movie.findByPk(id)
          .then((productToEdit) => {
            res.render("moviesEdit", { productToEdit: productToEdit });
            // , user: req.session.userLogged
          })
          .catch((err) => {
            res.send(err);
          });
    },
    update: function (req,res) {
        let movieId = req.params.id;
        let resultadoValidacionProduct = validationResult(req);
        if (!resultadoValidacionProduct.errors.length) {
          await db.Movie.update(
            {
              nombre: req.body.name,
              descripcion: req.body.description,
              imagen: req.file.filename,
              generos_id: req.body.categoria,
              precio: req.body.price,
              descuento: req.body.discount,
            },
            {
              where: { id: movieId },
            }
          )
            .then((productToEdit) => {
              res.redirect("/");
            })
            .catch((err) => {
              res.send(err);
            });
        } else {
          const id = req.params.id;
          await db.Movie.findByPk(id)
            .then((productToEdit) => {
              return res.render("moviesEdit", {
                productToEdit: productToEdit,
                user: req.session.userLogged,
                errors: resultadoValidacionProduct.mapped(),
                oldData: req.body,
              });
            })
            .catch((err) => {
              res.send(err);
            });
        }

    },
    // delete: function (req,res) {
    //     db.Movie.findAll({

    //     })
    // },
    destroy: function (req,res) {
        db.Movie.destroy({
            where: { id: req.params.id },
          });
          res.redirect("/");
    }
}

module.exports = moviesController;