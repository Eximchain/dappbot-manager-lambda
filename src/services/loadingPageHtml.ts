export const loadingPageHtml = `<!DOCTYPE html>
<html>
  <head><title>DappBot</title></head>
  <body>
    <div class="terminal">
      <p class="line1">$ dappsmith create --dapp<span class="cursor1">_</span></p>
      <p class="line2">this tool will parse your ABI and create and host a dapp at the specified subdomain. The process takes around 5 minutes to build and deploy. Happy hacking!<span class="cursor2">_</span></p>
      <p class="line3">[+] Fetching Dapp Seed<span class="cursor3">_</span></p>
      <p class="line3">[+] Loading ...<span class="cursor3">_</span></p>
      
      
      <p class="line3">[+] Complete, cleaning up resources... <span class="cursor3">_</span></p>
      
      <p class="line3">[+] Ready, to build some dapps... <span class="cursor3">_</span></p>
      <p class="line4-heading">> Building Dapp this will take some time, (DO NOT REFRESH THE PAGE) <span class="cursor4">_</span></p>
      
      <p class="line4">[+] Fetching Pythons ... <span class="cursor4">_</span></p>
      <p class="line4">[+] Calling Snake Charmers ... <span class="cursor4">_</span></p>
      <p class="line4">[+] Playing a tune... <span class="cursor4">_</span></p>   
      
      
      <p class="line5-heading">> CodeGen in progress (DO NOT REFRESH THE PAGE) <span class="cursor5">_</span></p>
      <p class="line5">[+] [2/519] Generating Models ... <span class="cursor5">_</span></p>
        <p class="line6">[+] [30/519] Generating Views & Controllers ... <span class="cursor6">_</span> </p>
      <p class="line6"> <span class="cursor6">...</span></p>
      
      <p class="line7-heading"> Inject blockchain capabilities</p>
      <p class="line7">[+] [156/519] Injecting web3 ...</p>
      <p class="line7">[+] [168/519] Injecting metamask... </p>
      <p class="line7">[+] [232/519] Setting up smart contract... </p>
      <p class="line7">[+] [232/519] Generate a component for each smart contract method...<span class="cursor7">_</span> </p>
      <p class="line7"> <span class="cursor7">...</span></p>
        
      
      <p class="line8-heading"> Configure Web Infrastructure</p>
      <p class="line8">[+] [416/519] Reserving Subdomain ...</p>
      <p class="line8">[+] [487/519] Configuring CNAME record... </p>
      <p class="line8">[+] [503/519] Setting up https... </p>
      <p class="line8">[+] [518/519] Propagating DNS record [ T - 3 min ]...<span class="cursor8">_</span> </p>
      <p class="line8"> <span class="cursor8">...</span></p>
        
        
        
        
      </div>
      
      <style>
      body {
          background-color: #272727;
          padding: 10px;
        }
        
        .terminal {
          background-color: #151515;
          box-sizing: border-box;
          width: 100%;
          margin: 0 auto;
          padding: 20px;
          border-bottom-left-radius: 5px;
          border-bottom-right-radius: 5px;
        }
        
        p {
          position: relative;
          left: 5%;
          height:0;
          text-align: left;
          font-size: 1.25em;
          font-family: monospace;
          white-space: normal;
          overflow: hidden;
          width: 0;
        }
        
        span {
          color: #fff;
          font-weight: bold;
        }
        /* WELCOME */
        .line1 {
          color: #9CD9F0;
          -webkit-animation: type .5s 1s steps(20, end) forwards;
          -moz-animation: type .5s 1s steps(20, end) forwards;
          -o-animation: type .5s 1s steps(20, end) forwards;
          animation: type .5s 1s steps(20, end) forwards;
        }
        
        .cursor1 {
          -webkit-animation: blink 1s 2s 2 forwards;
          -moz-animation: blink 1s 2s 2 forwards;
          -o-animation: blink 1s 2s 2 forwards;
          animation: blink 1s 2s 2 forwards;
        }
        /* LOADING */
        .line2 {
          color: #CDEE69;
          -webkit-animation: type 0.1s 4.25s steps(20, end) forwards;
          -moz-animation: type .1s 4.25s steps(20, end) forwards;
          -o-animation: type .1s 4.25s steps(20, end) forwards;
          animation: type 0.1s 4.25s steps(20, end) forwards;
        }
        
        .cursor2 {
          -webkit-animation: blink 1s 5.25s 2 forwards;
          -moz-animation: blink 1s 5.25s 2 forwards;
          -o-animation: blink 1s 5.25s 2 forwards;
          animation: blink 1s 5.25s 2 forwards;
        }
        
        .line3 {
          color: #E09690;
          -webkit-animation: type .5s 7.5s steps(20, end) forwards;
          -moz-animation: type .5s 7.5s steps(20, end) forwards;
          -o-animation: type .5s 7.5s steps(20, end) forwards;
          animation: type 1s 7.5s steps(20, end) forwards;
        }
        
        
        .cursor3 {
          -webkit-animation: blink 1s 8.5s 7 forwards;
          -moz-animation: blink 1s 8.5s 7 forwards;
          -o-animation: blink 1s 8.5s 7 forwards;
          animation: blink 1s 8.5s 7 forwards;
        }
        /* BUILDING */
        .line4-heading {
          color: #fff;
          -webkit-animation: type .5s 15.5s steps(20, end) forwards;
          -moz-animation: type .5s 15.5s steps(20, end) forwards;
          -o-animation: type .5s 15.5s steps(20, end) forwards;
          animation: type .5s 15.5s steps(20, end) forwards;
        }
        
        .line4 {
          color: #E09690;
          -webkit-animation: type .5s 15.5s steps(20, end) forwards;
          -moz-animation: type .5s 15.5s steps(20, end) forwards;
          -o-animation: type .5s 15.5s steps(20, end) forwards;
          animation: type .5s 15.5s steps(20, end) forwards;
        }
        .cursor4 {
          -webkit-animation: blink 1s 16.5s 14 forwards;
          -moz-animation: blink 1s 16.5s 14 forwards;
          -o-animation: blink 1s 16.5s 14 forwards;
          animation: blink 1s 16.5s 14 forwards;
        }
        .line5-heading {
          color: #fff;
          -webkit-animation: type .5s 30.5s steps(20, end) forwards;
          -moz-animation: type .5s 30.5s steps(20, end) forwards;
          -o-animation: type .5s 30.5s steps(20, end) forwards;
          animation: type .5s 30.5s steps(20, end) forwards;
        }
        .line5 {
          color: #E09690;
          -webkit-animation: type .5s 30.5s steps(20, end) forwards;
          -moz-animation: type .5s 30.5s steps(20, end) forwards;
          -o-animation: type .5s 30.5s steps(20, end) forwards;
          animation: type .5s 30.5s steps(20, end) forwards;
        }
        .cursor5 {
          -webkit-animation: blink 1s 30.5s 10 forwards;
          -moz-animation: blink 1s 30.5s 10 forwards;
          -o-animation: blink 1s 30.5s 10 forwards;
          animation: blink 1s 30.5s 10 forwards;
        }
        
        .line6 {
          color: #E09690;
          -webkit-animation: type .5s 40.5s steps(20, end) forwards;
          -moz-animation: type .5s 40.5s steps(20, end) forwards;
          -o-animation: type .5s 40.5s steps(20, end) forwards;
          animation: type .5s 40.5s steps(20, end) forwards;
        }
        .cursor6 {
          -webkit-animation: blink 1s 40.5s 15 forwards;
          -moz-animation: blink 1s 40.5s 15 forwards;
          -o-animation: blink 1s 40.5s 15 forwards;
          animation: blink 1s 40.5s 15 forwards;
        }
        .line7-heading {
          color: #fff;
          -webkit-animation: type .5s 55.5s steps(20, end) forwards;
          -moz-animation: type .5s 55.5s steps(20, end) forwards;
          -o-animation: type .5s 55.5s steps(20, end) forwards;
          animation: type .5s 55.5s steps(20, end) forwards;
        }
        .line7 {
          color: #E09690;
          -webkit-animation: type .5s 55.5s steps(20, end) forwards;
          -moz-animation: type .5s 55.5s steps(20, end) forwards;
          -o-animation: type .5s 55.5s steps(20, end) forwards;
          animation: type .5s 55.5s steps(20, end) forwards;
        }
        .cursor7 {
          -webkit-animation: blink 1s 55.5s 15 forwards;
          -moz-animation: blink 1s 55.5s 15 forwards;
          -o-animation: blink 1s 55.5s 15 forwards;
          animation: blink 1s 55.5s 15 forwards;
        }
      
      
      .line8-heading {
          color: #fff;
          -webkit-animation: type .5s 70.5s steps(20, end) forwards;
          -moz-animation: type .5s 70.5s steps(20, end) forwards;
          -o-animation: type .5s 70.5s steps(20, end) forwards;
          animation: type .5s 70.5s steps(20, end) forwards;
        }
        .line8 {
          color: #E09690;
          -webkit-animation: type .5s 70.5s steps(20, end) forwards;
          -moz-animation: type .5s 70.5s steps(20, end) forwards;
          -o-animation: type .5s 70.5s steps(20, end) forwards;
          animation: type .5s 70.5s steps(20, end) forwards;
        }
        .cursor8 {
          -webkit-animation: blink 1s 70.5s 180 forwards;
          -moz-animation: blink 1s 70.5s 180 forwards;
          -o-animation: blink 1s 70.5s 180 forwards;
          animation: blink 1s 70.5s 180 forwards;
        }
        @-webkit-keyframes blink {
          0% {
            opacity: 0;
          }
          40% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        
        @-moz-keyframes blink {
          0% {
            opacity: 0;
          }
          40% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        
        @-o-keyframes blink {
          0% {
            opacity: 0;
          }
          40% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        
        @keyframes blink {
          0% {
            opacity: 0;
          }
          40% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        
        @-webkit-keyframes type {
          to {
            width: 90%;
            height: 20px;
          }
        }
        
        @-moz-keyframes type {
          to {
            width: 90%;
            height: 20px;
          }
        }
        
        @-o-keyframes type {
          to {
            width: 90%;
            height: 20px;
          }
        }
        
        @keyframes type {
          1% {
              height: 20px;
          }
          to {
            width: 90%;
            height: 20px;
          }
        }
      </style>
  </body>
</html>`;

export default loadingPageHtml;