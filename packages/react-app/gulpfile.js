const gulp = require('gulp')
const gulpless = require('gulp-less')
const postcss = require('gulp-postcss')
const debug = require('gulp-debug')
var csso = require('gulp-csso')
const autoprefixer = require('autoprefixer')
const NpmImportPlugin = require('less-plugin-npm-import')
const { getNotionDatabase, getPageProperty } = require('./scripts/notion')
const fs = require('fs')

gulp.task('less', function () {
  const plugins = [autoprefixer()]

  return gulp
    .src('src/themes/*-theme.less')
    .pipe(debug({title: 'Less files:'}))
    .pipe(
      gulpless({
        javascriptEnabled: true,
        plugins: [new NpmImportPlugin({prefix: '~'})],
      }),
    )
    .pipe(postcss(plugins))
    .pipe(
      csso({
        debug: true,
      }),
    )
    .pipe(gulp.dest('./public'))
})

gulp.task('notion-sync', async () => {
  const projectsDB = await getNotionDatabase('70c8e70f88084a248015d2313f755519')
  const membersDB = await getNotionDatabase('856ad31d01c848448c34631c7b795d27')
  
  const members = membersDB
    .filter(page => getPageProperty(page, "Workstreams", "multi_select").includes("Moonshot Collective"))
    .map(page => ({ name: getPageProperty(page, "Name") }));
  const projects = projectsDB.map(page => {
    return { name: getPageProperty(page, 'Name'), link: getPageProperty(page, 'Github') }
  })

  
  const notionDB = {
    members: members.filter(member => Boolean(member.name)),
    projects: projects.filter(project => Boolean(project.name)),
  }
  
  console.log(notionDB)

  fs.writeFileSync('./public/static-info.json', JSON.stringify(notionDB))
})
