const gulp = require('gulp');
const concat = require('gulp-concat');

gulp.task('scripts', function() {
    return gulp.src([
        './view/assets/js/firebase.js',
        './view/assets/js/svg-icons.js',
        './view/assets/js/const.js',
        './view/assets/js/helper.js',
        './view/assets/js/bem.js',
        './view/assets/js/render.js',
        './view/assets/js/actions.js',
        './view/assets/js/validator.js',
        './view/assets/js/transaction.js',
		'./view/assets/js/google-tags.js',
		'./view/assets/js/branch-config.js',
        
    ])
    .pipe(concat('merged.js'))
    .pipe(gulp.dest('./view/assets/js/'));
});

gulp.task('default', gulp.series('scripts'));