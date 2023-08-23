(function ($) {

    /*
    * drcd  1.0
    * Copyright (c) 2021 Connor DeVries
    * Date: 2021-01-12
    */

    /** The root class for the drcd
    @name drcd
    @class This is the root class for the DE jQuery UI framework
    */
    $.drcd = $.drcd || {};

    // Extend the deui class/namespace
    $.extend($.drcd, {

        commonData: {
            pages: {
                home: {templateFile:'home.htm', title:'Home',onLoad:function(){
                    $.drcd.getSongs();

                }},
                
            }
                
            
        },
        loadMusicItems:function(){
        },
        getSongs : function(){
            let index = 0;
            fetch('/data/musicList',{
                method: 'GET',
               })
               .then(response => {
                console.log(response);
                 if (!response.ok) {
                   throw new Error("error getting teams");
                 }
                    return response.json();
                   
               }).then(files => {
                console.log('files:', files);
                 for(i in files){
                    // files[i].name
                    const audioitem = document.createElement('li');
                    audioitem.id = i;
                    audioitem.classList="list-group-item list-group-item-action";

                    const audiodiv = document.createElement('div');
                    audiodiv.classList="row align-items-center";

                    const audioName = document.createElement('p');
                    audioName.classList = "h5 col-7 text-truncate ";
                    audioName.textContent =files[i].name.replace(/\.[^/.]+$/, '');;

                    // const playBtn = document.createElement('button');
                    // playBtn.classList = "btn sm btn-outline-light col-2";
                    // //playBtn.addEventListener('click', );
                    // //playBtn.style = "width: 10%;";
                    // // <img src="/favicon.ico" alt="Avatar Logo" style="max-width: 45px; height: auto;" class="rounded">
                    // const playBtnIcon = document.createElement('img');
                    // playBtnIcon.src = "/images/play.png"
                    // playBtnIcon.classList = "img-fluid";
                    // playBtnIcon.style = "width: 1.5rem;";
                    // playBtn.append(playBtnIcon);

                    // const previewBtn = document.createElement('button');
                    // previewBtn.textContent = "Preview";
                    // previewBtn.classList = "btn btn-outline-dark col-3";
                    // //previewBtn.addEventListener('click', $.drcd.preview(i));
   

                    
                    const audioPlayer = document.createElement('audio');
                    audioPlayer.controls = true;
                    audioPlayer.classList = "col-5";
                    audioPlayer.muted = true;
                    audioPlayer.id = files[i].name;
                    const sourceElement = document.createElement('source');
                    sourceElement.src = `/audio/${files[i].name}`; // Set the audio source URL
                    sourceElement.type = 'audio/mpeg'; // Set the audio type
                    audioPlayer.addEventListener('play', function(event) {
                        if(audioPlayer.muted == true){
                            console.log(formatTime(audioPlayer.currentTime));
                            playSong(audioPlayer.id,formatTime(audioPlayer.currentTime));
                            // Call your function for when audio starts playing
                        }

                      });
                      audioPlayer.addEventListener('pause', function(event) {
                        console.log('Audio is paused.');
                        if(audioPlayer.muted == true){
                        pauseSong(audioPlayer.id);
                    }
                        // Call your function for when audio is paused
                      });
                      audioPlayer.addEventListener('seeked', function(event) {
                        console.log('Audio seeked to ' + audioPlayer.currentTime + ' seconds.');
                        // Call your function for when seeking occurs
                      });
                    audioPlayer.appendChild(sourceElement);

                     audiodiv.append(audioName);
                     audiodiv.append(audioPlayer);
                     const btnPreview = document.getElementById('btnPreview');
                     btnPreview.addEventListener('click', function() {

                         audioPlayer.muted = !audioPlayer.muted; // Toggle the muted property
                         // Call your function for when audio starts playing

                       });
                    // audiodiv.append(playBtn);
                    // audiodiv.append(previewBtn);

                    const container = document.getElementById('audioContainer'); // Replace with the actual container ID
                    audioitem.append(audiodiv)
                    container.append(audioitem);


                    
                 }
            });
            function playSong(filePath,startTime){
                let action = {"command":"start","filepath":filePath,"startTime":startTime};
                fetch('/songControl',{
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(action),
                   })
                   .then(response => {
                    console.log(response);
                     if (!response.ok) {
                       throw new Error("error playing Song");
                     }
                     console.log(response) ;
                   });
            }
            function pauseSong(filePath){
                let action = {"command":"pause","filepath":filePath};
                fetch('/songControl',{
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(action),
                   })
                   .then(response => {
                    console.log(response);
                     if (!response.ok) {
                       throw new Error("error playing Song");
                     }
                     console.log(response) ;
                   })
            }
            function formatTime(seconds) {
                const hours = Math.floor(seconds / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);
                const remainingSeconds = Math.floor(seconds % 60);
              
                const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
                return formattedTime;
              }
        },
        
        
        loadPage : function(pageIndex){
            
            if(window.history.state && window.history.state.pageIndex){
                let lastPageIndex = window.history.state.pageIndex;
                let page = $.drcd.commonData.pages[lastPageIndex];
                try{
                    if (page.onClose !== undefined){
                        page.onClose();
                    }
                 }catch(ex){
                     console.error("logPage:onClose", lastPageIndex, ex);
                 }
            }

            let page = $.drcd.commonData.pages[pageIndex];

            $.get("/templates/" + page.templateFile).then(
                function(data){
                    $('.pageContent').empty().html(data);
                    window.history.pushState({"pageIndex":pageIndex}, page.title, "/page/" + pageIndex);
                    try{
                       if (page.onLoad !== undefined){
                           page.onLoad();
                       }
                    }catch(ex){
                        console.error("logPage:onLoad", pageIndex, ex);
                    }
                },
                function(err){
                    console.error(err);
                }
            )

        },
 
        menuItemClick: function(evt){
            $.drcd.loadPage($(evt.currentTarget).attr("data-pageName"));
        },
        menuItemsLoad: function(){
            //Run through the pages json and add MenuItems for Each of the Pages
           let $menuItemTemplate =  $(".templates").find(".menuItemTemplate").find(".nav-item");
           let $menuItemsContainer = $(".navbar").find(".navbar-nav");
           $menuItemsContainer.empty();
           $.each($.drcd.commonData.pages, function(index,item){
               let $menuItem = $menuItemTemplate.clone();
               $menuItem.find("span").text(item.title);
               $menuItem.attr("data-pageName", index);
               $menuItem.on("click", $.drcd.menuItemClick);
               $menuItemsContainer.append($menuItem);
           })
        },
       
        init: function(){

            $.drcd.menuItemsLoad();
            

            let pathName = window.location.pathname;
            if(pathName.startsWith("/page/") == true){
                let pageIndex = pathName.substring(6);
                this.loadPage(pageIndex);
            }else{
                this.loadPage('home');
            }
        },

    });
})(jQuery);
