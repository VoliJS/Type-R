/*
Copyright 2015 Jesse Manek
Licensed under the Apache License, Version 2.0 (the "License"); you may
not use this file except in compliance with the License. You may obtain
a copy of the License at
  http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations
under
*/
console.info( 'Building Type-R docs...' );

var marked = require('marked')
var fs = require('fs')
var highlight = require('highlight.js')
var Handlebars = require('handlebars')
var path = require('path')

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: true,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  highlight: function (code, lang) {
    return highlight.highlight(lang || 'javascript', code).value
  }
})

// Create syntax-highlighting alias 'shell' for 'bash'
var bash = highlight.getLanguage('bash')
highlight.registerLanguage('shell', function (highlight) {
  return bash
})

// Easier than changing Slate's js
marked.defaults.langPrefix = 'highlight '

Handlebars.registerHelper('str', function (item) {
  return '"' + item + '"'
})

Handlebars.registerHelper('html', function (content) {
  return new Handlebars.SafeString(content)
})

fs.readFile('./index.md', 'utf8', function (err, content) {
  if (err) console.log(err)

  content = content.split(/---/g)

  if (content.length === 1) {
    throw new Error('No markdown page settings found!')
  }

  var data = {}
  var tokens = new marked.Lexer().lex(content[1])
  var token
  var listName

  for (var idx = 0; idx < tokens.length; idx++) {
    token = tokens[idx]
    if (token.type === 'list_item_start') {
      token = tokens[idx + 1].text

      if (listName === 'language_tabs') {
        var lang = token
        var langSplit = lang.split(':')
        if (langSplit.length === 1) token = {name: langSplit[0], text: langSplit[0]}
        if (langSplit.length === 2) token = {name: langSplit[0], text: langSplit[1]}
      }
      data[listName].push(token)
      idx += 2
    }

    if (token.type === 'paragraph') {
      if (tokens[idx + 1] !== undefined && tokens[idx + 1].type === 'list_start') {
        listName = token.text.slice(0, -1)
        data[listName] = []
      } else {
        token = token.text.split(': ')
        data[token[0]] = token[1]
      }
    }
  }

  if (data.includes) {
    // create partials
    for (var i = 0; i < data.includes.length; i++) {
      var includeFileName = data.includes[i]
      var includeFilePath = path.resolve(__dirname, '..', includeFileName + '.md')
      var includeContent = fs.readFileSync(includeFilePath, {encoding: 'utf8'})
      var markedInclude = marked(includeContent)
      Handlebars.registerPartial(includeFileName, markedInclude)
    }
  }
  fs.readFile('./lib/layouts/layout.html', 'utf8', function (err, source) {
    if (err) console.log(err)

    if (data.includes) {
      var includes = ''
      for (var i = 0; i < data.includes.length; i++) {
        var include = data.includes[i]
        includes += '\n' + '{{> ' + include + ' }}'
      }
      source = source.replace(/{{{html content}}}/g, '{{{html content}}}' + includes)
    }

    var template = Handlebars.compile(source)
    data['content'] = marked(content.slice(2).join(''))

    fs.writeFile('./index.html', template(data), function (err) {
      if (err){
        console.log(err);
      }
    })
  })
})
