# CuffLinks - a website makes you fancy

CuffLinks is a static website generation engine.
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

Open a console window at the CuffLinks directory.  Run `gulp`.
This will process the current files and create a website output folder in the CuffLinks directory called "dist".

At this point, the files are ready to be served by a local http server.
If you installed http-server from the prerequisites section above, open another console window at the CuffLinks "dist" directory. Run `http-server ./`.
Open a browser and point it to the displayed url (probably http://127.0.0.1:8080).

At this point, gulp is watching for changes to the source css, js, and templates directories.
Gulp will reprocess and generate new files to the dist directory.
The http-server will then serve those files.