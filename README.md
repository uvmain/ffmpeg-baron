# ffmpeg-baron
Downloads a platform-specific static ffmpeg binary for use in npm/npx scripts

- Downloads the latest version of ffmpeg
- Downloads from https://www.osxexperts.net for darwin platform
- Downloads from https://ffbinaries.com/api/v1/version/latest for other platforms

````
"scripts": {
    "dev": "cross-env ffmpeg_PATH=./node_modules/.bin/ffmpeg ..."
    "ffmpeg:version": "ffmpeg -version",
    "ffmpeg:tags": "ffmpeg -show_format -print_format json music.mp3"
}