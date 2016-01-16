# CuffLinks - a website makes you fancy

CuffLinks is a static website generation package.
It's currently setup to:
* css - process sass files, minfiy, and then revision the output filename
* javascript - combine multiple files, uglify (if prod), and then revision the output filename
* html - handle jade files, minify output, use the css/javascript revision filenames, and generate a sitemap
* images - compress images
* deployment - sends distribution folder to an AWS s3 bucket with different file caching options
* tracking - use one google analytics account for testing and one for production (tracking is off by default)

This project also comes preconfigured with:
* [HTML5 Boilerplate](https://html5boilerplate.com/)
* [jQuery](https://jquery.com/)
* [Modernizr](https://modernizr.com/)
* [Bootstrap](http://getbootstrap.com/)
* [Font Awesome](https://fortawesome.github.io/Font-Awesome/)
* [Google Analytics](https://www.google.com/analytics/)
* [Clean Blog Bootstrap theme from Start Bootstrap](http://startbootstrap.com/template-overviews/clean-blog/)


## Getting Started

There are a couple of ways to download CuffLinks:
* [Download the zip](https://github.com/CaseyHaralson/cufflinks/archive/master.zip)
* Clone the repo: `git clone https://github.com/caseyharalson/cufflinks.git`


## Prerequisites

[Download](https://git-scm.com/downloads) and install a git client.

[Download](https://nodejs.org/en/download/) and install nodeJs.

*Install bower (frontend technologies manager): `npm install -g bower`

*Install gulp (task runner): `npm install -g gulp`

*If you need a local http file server: `npm install -g http-server`

*Note: if you are on windows, these commands will need to be run from the git command window.


## Usage

Open a console window at the CuffLinks directory.
Run `npm install` to install the packages necessary for gulp to run (if you are on Windows, this will need to be run from the git command window).
Once that finishes, run `gulp`.
This will process the current files and create a website output folder in the CuffLinks directory called "dist".

At this point, the files are ready to be served by a local http server.
If you installed http-server from the prerequisites section above, open another console window at the CuffLinks "dist" directory. Run `http-server ./`.
Open a browser and point it to the displayed url (probably http://127.0.0.1:8080).

At this point, gulp is watching for changes to the source css, js, and templates directories.
Gulp will reprocess and generate new files to the dist directory.
The http-server will then serve those files.


## gulpfile.js

The configuration all happens in the gulpfile.js file.
At the beginning of the file there are several helpful configuration sections:  CONFIGURATIONS and CDN CACHE CONFIGURATIONS.
If you continue to look through the file, you will see gulp tasks that house the different types of processing that will happen durring that task.
At the end of the file are the tasks that group all the other tasks together.

---

### css task

Css output files can be created here.
The fonts are also copied over in this task.
At the end of the task, there is a merge function that will wait for any processes to finish before returning.

The "revision" process will give the file a unique name (so we can cache the file for a long time without fear of it not updating at the right time).
Because we create a file with a unique name, we need a way to pass that to our html templates so they can include the file.
The "fileNames" variable is here for that reason.
In the "inspect" process, the fileNames.css.main variable property is being updated with the new name.

### javascript task

Javascript output files can be created here.
At the end of the task, there is a merge function that will wait for any processes to finish before returning.
The same filename process from the css task is in this task as well.

If the gulp process is started with a "--prod" argument like `gulp --prod`, the javascript files will be sent through "uglify" and the output filename will include ".min".
This is done through the "gulpif" process.

---

### templates task

Html files are created from jade templates in this task.
This task waits for the css and javascript tasks to finish before starting.

Several variables are going to be passed to the jade processor.
The filenames we created in the css and javascript tasks, the current year (for the copyright footer info), and the Google Analytics account numbers are included.
Also, if the "--prod" argument is passed to the gulp process like `gulp --prod`, the production GA account number is used instead of the test account number.
If there isn't any GA account information, the GA script information won't be included in the output html files (look at templates/layouts/base.jade).
If the project should use GA tracking, the tracking.ga variables will need to be filled in the "CONFIGURATIONS" section.

To see the css and javascript files being included in the templates, look at templates/layouts/main.jade in the "styles" and "scripts" blocks.
The copyright year information can also be found in the main.jade file.

### sitemap task

The sitemap task waits until the templates task finishes and then processes all the html files into a sitemap.
The siteUrl in the "CONFIGURATIONS" section will need to be updated appropriately.

---

### clean task

This task cleans the distribution folder of any previous files.
All the other tasks probably wait for this task to complete before running.

### copy task

This task copies any files from the root "source" folder and copies it to the distribution folder.
Things like the favicon, robots, and crossdomain files will be copied in this task.

### images task

This task compresses any images and then outputs them to the distribution folder.

---

### s3 task

This task will take the files configured in the "CDN CACHE CONFIGURATIONS" section, gzip the files, and will send it to an AWS s3 bucket with the appropriate caching headers.
This task will probably want to run with the "prod" argument like `gulp s3 --prod`.
This task requires that an aws.json file be created in the project folder. This file should look like:
```
{
  "key": "AKIAI3Z7CUAFHG53DMJA",
  "secret": "acYxWRu5RRa6CwzQuhdXEfTpbQA+1XQJ7Z1bGTCx",
  "bucket": "dev.example.com",
  "region": "us-east-1"
}
```

---

### build task

The build task waits for the other tasks, besides the s3 task, to complete.
This really just makes all the other tasks run.

### watch task

This task will continually run while watching for changes in certain folders.
The task currently watches for changes to the jade templates, to the css files, and to the javascript files.
When it detects a change, the build task will be called again so the file server should be serving out current files all the time.

### default task

This task lets gulp know what to do when a specific task isn't called.  Currently it is set to run the "watch" task.

So, if you run `gulp` it will run the "watch" task.  You could also call the "watch" task by running `gulp watch`.