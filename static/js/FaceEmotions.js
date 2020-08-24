// check using phone or not
    if (/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) {
        alert('Sorry, this website not support mobile divices currently.');
        history.back();
    }

    // check using chrome
    if (!window.chrome) {
        if (confirm('This website needs Chrome browser!!!')) {
            closewin();
        } else {
            history.back();
        }
    }

    var constraints = {
        video: true
    };

	var hat = document.getElementById('hat');


	var $body = document.querySelector('body');
    //    var status = document.getElementById('status');

	const emotion_labels = ["angry", "disgust", "fear", "happy", "sad", "surprise", "neutral"];
	const position_of_emotions2 = tf.tensor([[0.5,1],[0.5,1],[0,1],[1,0.5],[0,0],[0,1],[0.6,0.4]]);
	let seq_of_emotions = [];
	let interval_boundaries = [];
	let seq_of_emotional_positions = [];

    const emotion_colors = ["#ff0000", "#00a800", "#ff4fc1", "#ffe100", "#306eff", "#ff9d00", "#7c7c7c"];
    var offset_x = 15;
    var offset_y = 40;

    loadModel(model_json_path);
    // create model
    async function createModel(path) {
        let model_tmp = await tf.loadModel(path);
        return model_tmp;
    }

    // load models
    async function loadModel(path) {
        var status = document.getElementById('status');
        //        status.innerText = "Model Loading ..."
        model = await createModel(path);

        status.innerText = "Model Loaded !!!";
    }


    function createVideoElement() {
        let $video = document.createElement('video');
        $video.style.maxWidth = '100vw';
        $video.style.width = '100vw';
        $video.style.maxHeight = '0vh';
        $body.appendChild($video);
        return $video;
    }

    function handleError(error) {
        if (error.name === 'DevicesNotFoundError') {
            alert('No camera detected. <br> Do you have any camera connected?');
        } else if (error.name === 'NotAllowedError') {
            alert('You have to allow camera access in order to run this experiment.');
        } else if (navigator.userAgent.indexOf('Chrome') > -1) {
            alert('Error. <br> Enable experimental features on chrome://flags/#enable-experimental-web-platform-features');
        } else {
            alert('Error. <br> Does your browser supports FaceDetector API?');
        }
        console.error(error)
    }

    function createCanvas(video) {

        const canvas = document.getElementById('canvas');
        const videoCompStyle = window.getComputedStyle(video);
        canvas.width = videoCompStyle.width.replace('px', '');
        canvas.height = videoCompStyle.height.replace('px', '');
        //        canvas.style.display = 'none'
        // document.querySelector('body').appendChild(canvas);

        return canvas;
    }

    function createDrawFunction() {

        const faceDetector = new window.FaceDetector({
            maxDetectedFaces: 1
        })
        let isDetectingFaces = false;
        let faces = [];
        let hideTimeout;

		//initial position analyze window
		let s_x = -999;
        let s_y = -999;
        let s_w = 100;
        let s_h = 100;

        return async function draw(canvas, video) {
            window.requestAnimationFrame(() => draw(canvas, video));
            const context = canvas.getContext('2d');
            const videoCompStyle = window.getComputedStyle(video);
            const videoWidth = videoCompStyle.width.replace('px', '');
            const videoHeight = videoCompStyle.height.replace('px', '');
            context.drawImage(video, 0, 0, videoWidth, videoHeight);
            //            context.clearRect(0, 0, canvas.width, canvas.height);
            //            clearTimeout(hideTimeout)
            if (faces.length) {

                //                let canvas = document.getElementById('canvas')
                //                let scale = 1;

                for (var i = 0; i < faces.length; i++) {
                    var item = faces[i].boundingBox;
                    //                    console.log(item)
                    s_x = Math.floor(item.x - offset_x / 2);
                    s_y = Math.floor(item.y - offset_y / 2);
                    s_w = Math.floor(item.width + offset_x);
                    s_h = Math.floor(item.height + offset_y);

                    let cT = context.getImageData(s_x, s_y, s_w, s_h);
                    cT = preprocess(cT);
                    z = model.predict(cT);
					var em = [];
					for (let i = 0; i < 7; i++) {em.push(z.dataSync()[i]);}

					seq_of_emotions.push(em);

                }
            } else {
                console.log('NO FACE');
                //                status.innerHTML = "NO FACE";
            }

			var hat_offset = s_w*0.1;
			var hat_w = s_w + 2*hat_offset;
			context.drawImage(hat, s_x-hat_offset, s_y-s_h*0.7, hat_w, hat_w*(117./190));

            if (isDetectingFaces) {
                return;
            }

            isDetectingFaces = true;
			faces = await faceDetector.detect(canvas);
            isDetectingFaces = false;
            var status = document.getElementById('status');
            status.innerHTML = "Running the model ... ";
        }
    }

    function preprocess(imgData) {
        return tf.tidy(() => {
            let tensor = tf.fromPixels(imgData).toFloat();

            tensor = tensor.resizeBilinear([100, 100]);

            tensor = tf.cast(tensor, 'float32');
            const offset = tf.scalar(255.0);
            // Normalize the image
            const normalized = tensor.div(offset);
            //We add a dimension to get a batch shape
            const batched = normalized.expandDims(0);
            return batched;
        })
    }


    function playCameraOnVideo(video) {
        return navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    frameRate: 60
                },
                audio: false
            })
            .then(srcObject => video.srcObject = srcObject)
            .then(() => video.play())
    }

    async function main(video) {
        const video_canvas = createCanvas(video);
        const draw = createDrawFunction();
        draw(video_canvas, video);
    }

    function startVideo() {
        let elem = document.getElementById('start');
        elem.parentNode.removeChild(elem);
        var status = document.getElementById('status');
        status.innerHTML = "Initializing the camera ... ";

		/*
		var button = document.createElement("input");
		button.type = "button";
		button.value = "end exam";
        button.onclick = end_exam;
        document.body.appendChild(button);

		var button2 = document.createElement("input");
		button2.type = "button";
		button2.value = "next task";
        button2.onclick = new_task;
        document.body.appendChild(button2);
		*/


        var ori = document.getElementById("original_video");
        //        var emo = document.getElementById("emotion_video");
        ori.innerHTML = "Original: "
        //        emo.innerHTML = "Result : "
        playCameraOnVideo(video)
            .then(() => main(video))
            .catch(handleError)

    }
	/*
	function new_task(){
		interval_boundaries.push(seq_of_emotions.length);
	}
	*/

	function end_exam(){
		let N = interval_boundaries.length-1;
		for(var i = 0; i<N;i++){
			console.log("task ",i+1,":");
			if(interval_boundaries[i]==interval_boundaries[i+1]){console.log("no information");}
			else{
				em_seq = tf.tensor(seq_of_emotions.slice(interval_boundaries[i], interval_boundaries[i+1]));
				em = em_seq.mean(0);
				em_position = (tf.dot(em,position_of_emotions2)).dataSync();
				console.log("skill level (experience in the task) = ",em_position[0]);
				console.log("difficulty of the task = ",em_position[1]);
				seq_of_emotional_positions.push(em_position);

			}
			console.log("---------------------------------------");
		}
	}