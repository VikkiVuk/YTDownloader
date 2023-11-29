import './home.css';
import React from 'react';
import {Helmet} from 'react-helmet';
import 'react-toastify/dist/ReactToastify.css';
import {toast, ToastContainer} from 'react-toastify';

const Home = (props) => {
    const download = () => {
        const link = document.getElementById('link').value;
        if (link === '') {
            toast.error('Please enter a link to download.', { theme: 'dark' });
        } else {
            const loading = toast.loading('Opening connection...', { theme: 'dark' });
            const socket = new WebSocket('wss://ytdownloader-tmwgc24efq-uc.a.run.app');

            let videoChunks = [];

            socket.addEventListener('open', () => {
                console.log('WebSocket connection established.');

                // Send the video URL to the backend
                const message = { url: link };
                socket.send(JSON.stringify(message));
                toast.update(loading,{ render: 'Contacting server...', type: 'info', theme: 'dark' });
            });

            let started = false;
            let fileFormat = 'mp4';
            let totalBytes = 0;
            let downloadedBytes = 0;
            let videoTitle = '';

            socket.addEventListener('message', (event) => {
                if (!started) {
                    started = true;
                    toast.update(loading, { render: 'Downloading...', type: 'info', theme: 'dark', isLoading: true });
                }

                const data = JSON.parse(event.data);
                if (data.type === 'metadata') {
                    // Handle video metadata
                    videoTitle = data.title;
                    totalBytes = data.size;
                    fileFormat = data.fileFormat;
                    console.log(`Video Title: ${videoTitle}`);
                    console.log(`Total Bytes: ${totalBytes}`);
                    console.log(`File Format: ${fileFormat}`);

                    toast.update(loading, {
                        render: `Starting download of ${videoTitle}...`,
                        type: 'info',
                        theme: 'dark',
                        isLoading: true
                    });
                } else if (data.type === 'chunk') {
                    // Handle received video chunk
                    const chunk = new Uint8Array(data.data.data);
                    downloadedBytes += chunk.byteLength;
                    console.log(`Received chunk: ${chunk.byteLength} bytes`);
                    videoChunks.push(chunk);

                    toast.update(loading, { render: `Downloading... ${((downloadedBytes / totalBytes) * 100).toFixed(2)}%`, type: 'info', theme: 'dark', isLoading: true });
                } else if (data.type === 'end') {
                    // Handle end of video streaming
                    console.log('Video streaming completed.');

                    // Assemble the video chunks into a Blob
                    const videoBlob = new Blob(videoChunks, { type: 'video/' + fileFormat });

                    // Create a download link for the video
                    const downloadLink = document.createElement('a');
                    downloadLink.href = URL.createObjectURL(videoBlob);

                    downloadLink.download = videoTitle + '.' + fileFormat; // Set the desired filename

                    // Simulate a click on the download link to initiate the download
                    downloadLink.click();

                    socket.close();

                    toast.update(loading, { render: 'Download completed!', type: 'success', theme: 'dark', isLoading: false });
                } else if (data.type === "status") {
                    toast.update(loading, { render: "Connection established!", type: 'info', theme: 'dark', isLoading: false });
                }
            });

            socket.addEventListener('close', () => {
                console.log('WebSocket connection closed.');
                toast.update(loading, { render: 'Connection finished.', type: 'info', theme: 'dark', autoClose: 3000, isLoading: false })
            });

            socket.addEventListener('error', (error) => {
                console.log('Error occurred:', error.message);
                socket.close();
            });
        }
    };

    return (
        <div className="home-container">
            <ToastContainer />
            <Helmet>
                <title>Youtube Downloader</title>
                <meta name="description" content="Download any youtube videos you like, free of charge." />
                <meta property="og:title" content="Youtube Downloader" />
                <meta property="og:description" content="Download any YouTube video you wish, free of charge." />
                <meta property="og:image" content="/logo-transparent.png" />
            </Helmet>
            <div className="home-container1">
                <img alt="image" src="/logo-transparent.png" className="home-image" />
                <h1 className="home-text">
                    <span>Youtube Downloader</span>
                    <br className="home-text2"></br>
                    <span>
                        <span dangerouslySetInnerHTML={{ __html: ' ' }} />
                    </span>
                </h1>
                <h1 className="home-text4">Download any youtube video here!</h1>
                <div className="home-container2">
                    <input
                        type="link"
                        id="link"
                        required={true}
                        autoFocus={true}
                        placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                        className="home-textinput input"
                    />
                    <button className="home-button button" onClick={download}>
                        Download
                    </button>
                </div>
                <div className="home-links">
                    <h1 className="home-text5">Made with 💖 by Wulfco</h1>
                </div>
            </div>
        </div>
    );
};

export default Home;