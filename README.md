<p align="center">
  <div align="center">
    <img width=64 src="./src/assets/logo.png"/>
  </div>
  <h1 align="center">Tsugi</h1>
</p>
<p align="center">A site-agnostic show tracking extension</p>
<p align="center"><i>tsugi meaning "next"</i></p>

## Building

to build the extension and load it locally, run
```bash
npm install
npm run build
```

This will output the extension content into a folder named `build`, which is
ready to be loaded into chrome on the chrome://extensions page.

## Quick Start

If it's too much of a chore to clone and build the project, you can always open the 
repo up in a github codespace and run
```bash
npm install
npm run pack
```
Then all you need to do is download the file `build.zip` onto your machine 👏