const gulp = require('gulp');
const zip = require('gulp-zip');
const del = require('del');
const install = require('gulp-install');
const runSequence = require('run-sequence');
const terraform = require('@kennship/gulp-terraform');

gulp.task('build-clean', function() {
	return del(['./dist', './.nyc_output', 'dist-lambda.zip', 'dist-lambda']);
});

gulp.task('build-copy-lib', function() {
	return gulp.src('lib/**')
		.pipe(gulp.dest('dist/lib'));
});

gulp.task('build-node-mods', function() {
	return gulp.src('./package.json')
		.pipe(gulp.dest('dist/'))
		.pipe(install({production: true}));
});

gulp.task('build-copy-lambda', function() {
	return gulp.src('*-lambda.js')
		.pipe(gulp.dest('dist/'));
});

gulp.task('build-zip', function() {
	return gulp.src(['dist/**', '!dist/package.json', '!dist/package-lock.json'], {nodir: true})
		.pipe(zip('dist-lambda.zip'))
		.pipe(gulp.dest('./'));
});

gulp.task('build-package', function(callback) {
	return runSequence(
		['build-clean'],
		['build-copy-lib', 'build-copy-lambda'],
		['build-node-mods'],
		['build-zip'],
		callback
	);
});

let terraform_vars = {
	nrdp_user: process.env['NRDP_USER'],
		nrdp_pass: process.env['NRDP_PASS'],
		darwin_token: process.env['DARWIN_TOKEN'],
		s3_bucket_name: process.env['S3_BUCKET_NAME']
};

gulp.task('terraform-plan', () => terraform.plan("./", {
	vars: terraform_vars
}));

gulp.task('terraform-validate', () => terraform.validate("./", {
	vars: terraform_vars
}));

gulp.task('terraform-deploy', () => terraform.apply("./",{
	vars: terraform_vars,
	args: {
		"auto-approve": true
	}
}));

gulp.task('terraform-destroy', () => terraform.destroy("./",{
	vars: terraform_vars,
	args: {
		"auto-approve": true
	}
}));

gulp.task('deploy', function(callback) {
	return runSequence(
		['build-package'],
		['terraform-deploy'],
		callback
	);
});