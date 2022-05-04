const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'MUSIC_PLAYER'

const player = $('.player')
const cd = $('.cd')
const heading = $('header h2')
const cdThumbnail = $('.cd-thumb')
const audio = $('#audio')
const playButton = $('.btn-toggle-play')
const prevButton = $('.btn-prev')
const nextButton = $('.btn-next')
const randomButton = $('.btn-random')
const repeatButton = $('.btn-repeat')
const progress = $('.progress')
const playlist = $('.playlist')

console.log(repeatButton)

const app = {
    currentIndex: 0,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    isPlaying: false,
    setConfig: function(key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    // isRandom: false,
    // isRepeat: false,
    songs: [
        {
            name: 'Cam bay tinh yeu',
            singer: 'Phan Dinh Tung',
            path: './assets/musics/Cam-Bay-Tinh-Yeu-Phan-Dinh-Tung.mp3',
            image: './assets/images/phan-dinh-tung-image.jpg'
        },
        {
            name: 'Lieu thuoc cho trai tim',
            singer: 'Ly Hai',
            path: './assets/musics/Lieu-Thuoc-Cho-Trai-Tim-Ly-Hai.mp3',
            image: './assets/images/ly-hai-image.jpg'
        },
        {
            name: 'Tha rang nhu the',
            singer: 'Ung Hoang Phuc',
            path: './assets/musics/Tha-Rang-Nhu-The-Ung-Hoang-Phuc.mp3',
            image: './assets/images/ung-hoang-phuc-image.jpg'
        },
        {
            name: 'Tinh don phuong',
            singer: 'Lam Truong',
            path: './assets/musics/Tinh-Don-Phuong-Lam-Truong.mp3',
            image: './assets/images/lam-truong-image.jpg'
        },
        {
            name: 'Tinh khuc vang',
            singer: 'Dan Truong',
            path: './assets/musics/Tinh-Khuc-Vang-Dan-Truong.mp3',
            image: './assets/images/dan-truong-image.jpg'
        },
    ]
    ,
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playlist.innerHTML = htmls.join('')

    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvent: function() {
        const _this = this
        const cdWidth = cd.offsetWidth

        // Xu ly quay va dung cd
        const cdThumbnailAnimate = cdThumbnail.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000,
            iterations: Infinity
        })

        cdThumbnailAnimate.pause()

        // Xu ly thu phong thumbnail
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }
        
        // Xu ly khi click nut play
        playButton.onclick = function() {
            if (_this.isPlaying) {
                audio.pause()
                return
            }
            audio.play()
        }

        // Khi bai hat duoc phat
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbnailAnimate.play()
        }

        // Khi bai hat bi tam dung
        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbnailAnimate.pause()
        }

        // Khi doan thanh tua bai hat duoc thay doi
        audio.ontimeupdate = function() {
            const progressPercentage = Math.floor(audio.currentTime / audio.duration * 100)
            progress.value = progressPercentage
        }

        // Xu ly chuyen sang bai hat khac khi het bai
        audio.onended = function() {
            if(_this.isRepeat) {
                audio.play()
            }
            else {
                setTimeout(function() {
                    nextButton.click()
                }, 2000)
            }
        }

        // Xu ly khi tua bai hat
        progress.onchange = function(e) {
            const seekTime = Math.floor(e.target.value * audio.duration / 100)
            audio.currentTime = seekTime
        }

        // Khi chuyen toi sang bai hat khac 
        nextButton.onclick = function() {
            if(_this.isRandom) {
                _this.randomSongAction()
            }
            else {
                _this.nextSongAction()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Khi lui ve mot bai hat
        prevButton.onclick = function() {
            if(_this.isRandom) {
                _this.randomSongAction()
            }
            else {
                _this.prevSongAction()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Khi click random
        randomButton.onclick = function() {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            this.classList.toggle('active', _this.isRandom)
        }

        // Khi click repeat
        repeatButton.onclick = function() {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            this.classList.toggle('active', _this.isRepeat)
        }

        // Khi click mot bai hat bat ki 
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            if(songNode || e.target.closest('.option')) {
                if(songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }
            }
        }
    },
    scrollToActiveSong: function() {
        setTimeout(function() {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            })
        }, 500)
    },
    nextSongAction: function() {
        this.currentIndex++
        if(this.currentIndex === this.songs.length) {
            this.currentIndex = 0
        }   
        this.loadCurrentSong()
    },
    prevSongAction: function() {
        this.currentIndex--
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    randomSongAction: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        }
        while (newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    loadCurrentSong: function() {
        heading.innerText = this.currentSong.name
        cdThumbnail.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = `${this.currentSong.path}`
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom ?? false
        this.isRepeat = this.config.isRepeat ?? false
    },
    start: function() {
        
        // Load config tu local storage vao ung dung
        this.loadConfig()

        // Dinh nghia cac thuoc tinh cho Object
        this.defineProperties()

        // Xu ly cac su kien
        this.handleEvent()

        // Tai bai hat dau tien vao UI 
        this.loadCurrentSong()
        
        // Render giao dien
        this.render()

        // Hien thi nut random hoac repeat
        randomButton.classList.toggle('active', this.isRandom)
        repeatButton.classList.toggle('active', this.isRepeat)
    }
}

app.start()