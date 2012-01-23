var Comment = require('../models/comment');

var pg = require('pg').native;
var connectionString = process.env.DATABASE_URL || 'postgres://postgres@localhost:5432/thisisourstop'
var client;

client = new pg.Client(connectionString);
client.connect();


var fs = require('fs');
var comment_template = null;

fs.readFile('views/admin/comment.ejs', function(error, content) {
  comment_template = content;
});

module.exports = function(app) {

  app.param('comment', function(req, res, next, cid){
    Comment.get(cid, function(err, comment){
      if (err === null) {
        req.comment = comment;
        next();
      }
      else {
        next(err);
      }
    });
  });

  // All comments.
  app.get('/all.:format?', function(req, res) {
    Comment.all(function(comments) {
      if(req.params.format === 'json' || req.xhr) {
        res.json({ comments: comments });
      }
      else {
        res.render('admin/all', { comments: comments, page_id: 'admin', comment_template: comment_template });
      }
    });
  });

  // All comments.
  app.get('/admin/moderate.:format?', function(req, res) {
    Comment.all(function(comments) {
      if(req.params.format === 'json' || req.xhr) {
        res.json({ comments: comments });
      }
      else {
        res.render('admin/moderate', { comments: comments, page_id: 'admin', comment_template: comment_template });
      }
    });
  });

  // Individual comment info.
  app.get('/stop/:stop/comment/:comment.:format?', function(req, res) {
      if(req.params.format === 'json' || req.xhr) {
        res.json({ comment: req.comment });
      }
      else {
        res.render('admin', { comments: req.comment });
      }
  });

  // Need more mods.
  app.get('/stop/:stop/comment/:comment/flag/:flag.:format?', function(req, res) {
    Comment.flag(req.comment, req.params.flag, req.connection.remoteAddress, function(savedComment) {
      if(req.params.format === 'json' || req.xhr) {
        res.json({ comment: savedComment });
      }
      else {
        // Back where we came from.
        res.redirect('/stop/' + req.params.stop + '/#comment-' + req.comment.cid);
      }
    });
  });

};
