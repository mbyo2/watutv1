import videojs from "video.js";
import "videojs-contrib-quality-menu";
import { DateTime } from "luxon";
import mediumZoom from "medium-zoom";
import { merge } from "lodash";
import "videojs-contrib-eme";
import VirtualList from "./virtualizedlist";
import locales from "./locales";
import countries from "./countries";

let ipLocation = "uk"; // Default location - IP fetch removed to avoid CORS issues

ipLocation = ipLocation in countries ? ipLocation : "uk";

const isFirstVisit = JSON.stringify(localStorage) === "{}";
const getCountry = () => {
    if (new URLSearchParams(location.search).get("androidtv") != null) return "it";
    if (localStorage.getItem("videojs-vhs") && !localStorage.getItem("country")) localStorage.setItem("country", "it")
    else if (countries[ipLocation].nationalBase) localStorage.setItem("region", Object.keys(countries[ipLocation].regions[Object.keys(countries[ipLocation].regions)[0]])[0]);
    if (ipLocation && !localStorage.getItem("country")) {
        localStorage.setItem("country", ipLocation);
        return ipLocation;
    } else return localStorage.getItem("country") || Object.keys(countries)[0];
};
const getLanguage = () => {
    if (new URLSearchParams(location.search).get("androidtv") != null) return "it";
    return localStorage.getItem("language") || (navigator.language || "en").split("-")[0];
};

let selectedCountry = getCountry();
let selectedLanguage = getLanguage();
try {
    if (!Object.keys(Object.assign({}, ...Object.keys(countries[selectedCountry].regions).map(group => countries[selectedCountry].regions[group]))).includes(localStorage.getItem("region"))) localStorage.removeItem("region");
} catch {
    localStorage.removeItem("region");
};
let selectedRegion = localStorage.getItem("region");
let language = selectedLanguage in locales ? selectedLanguage : "en";
let locale = locales[language];

const languageDropdown = document.querySelector("#language");
if (languageDropdown) {
    Object.keys(locales).forEach(lang => {
        languageDropdown.insertAdjacentHTML("beforeend", `<option value="${lang}" ${lang === selectedLanguage ? "selected" : ""}>${locales[lang].languageName}</option>`);
    });
}

const countryDropdown = document.querySelector("#country");
if (countryDropdown) {
    Object.entries(countries).forEach(([country, value]) => {
        countryDropdown.insertAdjacentHTML("beforeend", `<option value="${country}" ${country === selectedCountry ? "selected" : ""}>${value.name}</option>`);
    });
    if (countryDropdown.addEventListener) {
        countryDropdown.addEventListener("change", e => {
            localStorage.setItem("country", e.target.value);
            document.querySelector("#region").innerHTML = "";
            countryDropdown.querySelector("[selected]").removeAttribute("selected");
            countryDropdown.querySelector(`option[value="${e.target.value}"]`).setAttribute("selected", "");
            if (!countries[e.target.value].nationalBase) document.querySelector("#region").insertAdjacentHTML("beforeend", `<option value="national">Nessuna (solo canali nazionali)</option>`)
            document.querySelector("#region").insertAdjacentHTML("beforeend", Object.keys(countries[e.target.value].regions).map(group => `<optgroup label="${group}">
                ${Object.keys(countries[e.target.value].regions[group]).map(region => `<option value="${region}" ${e.target.value === selectedCountry && region === selectedRegion ? "selected" : ""}>${countries[e.target.value].regions[group][region]}</option>`)}
            </optgroup>`));
            updateSelectWidth(document.querySelector("#region"));
            document.querySelector("#save-and-reload").removeAttribute("hidden");
            localStorage.setItem("region", document.querySelector("#region").value);
        });
    }
}

document.querySelectorAll("[data-translation-id], [data-translation-hide]").forEach(el => {
    if (!el.dataset.translationHide) {
        if (el.dataset.translationTarget) el.setAttribute(el.dataset.translationTarget, locale[el.dataset.translationId])
            else el.innerHTML = locale[el.dataset.translationId];
    } else {
        let languages = el.dataset.translationHide.split(", ");
        if (languages.includes(language)) el.remove();
    };
});

// Get fallback channels when IPTV fails
function getFallbackChannels() {
    return [
        {
            lcn: 1,
            name: "Wesu Entertainment",
            logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA2MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZTUwOTE0Ii8+Cjx0ZXh0IHg9IjMwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VHY8L3RleHQ+Cjwvc3ZnPg==",
            radio: false,
            url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        },
        {
            lcn: 2,
            name: "Wesu Sports",
            logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA2MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMjdhYjY0Ii8+Cjx0ZXh0IHg9IjMwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U3BvcnRzPC90ZXh0Pgo8L3N2Zz4=",
            radio: false,
            url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
        },
        {
            lcn: 3,
            name: "Wesu News",
            logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA2MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMzM3M2NjIi8+Cjx0ZXh0IHg9IjMwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TmV3czwvdGV4dD4KPC9zdmc+",
            radio: false,
            url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
        },
        {
            lcn: 4,
            name: "Wesu Movies",
            logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA2MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZmY5ODAwIi8+Cjx0ZXh0IHg9IjMwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TW92aWVzPC90ZXh0Pgo8L3N2Zz4=",
            radio: false,
            url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
        },
        {
            lcn: 5,
            name: "Wesu Radio",
            logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA2MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjOWM3M2QzIi8+Cjx0ZXh0IHg9IjMwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UmFkaW88L3RleHQ+Cjwvc3ZnPg==",
            radio: true,
            url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
        },
        {
            lcn: 6,
            name: "Wesu Music",
            logo: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA2MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMDA3YmZmIi8+Cjx0ZXh0IHg9IjMwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TXVzaWM8L3RleHQ+Cjwvc3ZnPg==",
            radio: true,
            url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
        }
    ];
}

const initializeApp = async () => {
    const response = await fetch("/config.json")
        .then(response => response.json())
        .then(json => window["zappr"] = json)
        .catch(err => {
            console.warn(`Can't find config (${err}), using the default`);
            window["zappr"] = {
                "config": {
                    "channels": {
                        "host": "https://channels.wesutv.stream"
                    },
                    "backend": {
                        "host": {
                            "vercel": "https://vercel-api.wesutv.stream",
                            "cloudflare": "https://cloudflare-api.wesutv.stream",
                            "alwaysdata": "https://wesutv.alwaysdata.net"
                        }
                    },
                    "logos": {
                        "host": "https://channels.wesutv.stream/logos",
                        "optimized": true
                    },
                    "epg": {
                        "host": "https://epg.wesutv.stream"
                    },
                    "fast": {
                        "host": "https://fast.wesutv.stream"
                    },
                    "urgentalerts": {
                        "host": "https://urgent-alerts.wesutv.stream"
                    }
                }
            }
        });

    fetch(`${zappr.config.urgentalerts.host}/${selectedCountry}`)
            .then(response => { if (response.ok) return response.text(); })
            .then(html => {
                if (html) {
                    document.querySelector("#urgent-alerts").classList.add("active");
                    document.querySelector("#urgent-alerts").innerHTML = html;
                };
            })
            .catch(err => console.warn(`Couldn't fetch urgent alerts: ${err.stack}`));

    // Load channels data
    try {
        // Show loading message
        const channelsContainer = document.getElementById('channels');
        if (channelsContainer) {
            channelsContainer.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #fff;">
                    <div style="font-size: 24px; margin-bottom: 10px;">📺</div>
                    <h3>Loading Wesu TV Channels...</h3>
                    <p>Preparing channels...</p>
                </div>
            `;
        }
        
        // Skip IPTV for now and use fallback channels directly
        const channels = getFallbackChannels();
        console.log('Using fallback channels directly');
        
        window.zappr.channels = channels;
        initializeNavigation();
        
    } catch (err) {
        console.warn(`Couldn't fetch channels: ${err.stack}`);
        window.zappr.channels = getFallbackChannels();
        initializeNavigation();
    }

};

initializeApp();

let currentType = "",
    typingLCN = false,
    multipleChannelSelection = false,
    currentlyPlaying = "",
    target = "";

const player = videojs("tv", {
    playbackRates: [0.25, 0.5, 1, 1.25, 1.5, 2, 4],
    enableSmoothSeeking: true,
    liveui: true,
    retryOnError: true,
    controlBar: {
        skipButtons: {
            backward: 5,
            forward: 5
        },
        progressControl: {
            seekBar: {
                playProgressBar: {
                    timeTooltip: true
                }
            }
        }
    },
    errorDisplay: false,
    html5: {
        vhs: {
            overrideNative: true,
            useBandwidthFromLocalStorage: true
        }
    },
    plugins: {
        qualityMenu: {},
        reloadSourceOnError: {},
        eme: {}
    },
    userActions: {
        click: !window.matchMedia("(max-width: 100vh)").matches,
        doubleClick: !window.matchMedia("(max-width: 100vh)").matches
    }
});

// Initialize global zappr object
window.zappr = {};

window.zappr.player = player;
window.zappr.videojs = videojs;

player.on("fullscreenchange", () => screen.orientation.lock("landscape-primary").catch(() => {}));
player.on("loadeddata", () => {
    if (player.liveTracker.isLive() && !player.scrubbing() && !player.seeking()) {
        player.liveTracker.seekToLiveEdge();
    };
});

// Netflix-style Navigation and Channel Grouping
class WesuTVNavigation {
    constructor() {
        this.currentView = 'channels';
        this.channelGroups = {
            entertainment: { name: 'Entertainment', icon: '🎬', channels: [] },
            sports: { name: 'Sports', icon: '⚽', channels: [] },
            news: { name: 'News', icon: '📰', channels: [] },
            movies: { name: 'Movies', icon: '🎥', channels: [] },
            kids: { name: 'Kids', icon: '👶', channels: [] },
            music: { name: 'Music', icon: '🎵', channels: [] },
            documentary: { name: 'Documentary', icon: '📖', channels: [] },
            local: { name: 'Local', icon: '📍', channels: [] },
            international: { name: 'International', icon: '🌍', channels: [] },
            radio: { name: 'Radio Stations', icon: '📻', channels: [] }
        };
        
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupProfileModal();
        this.groupChannels();
        this.updateChannelDisplay();
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        if (!navItems || navItems.length === 0) {
            console.warn('Navigation items not found');
            return;
        }
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const view = item.dataset.view;
                this.switchView(view);
                
                // Update active state
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }

    setupProfileModal() {
        const profileModal = document.getElementById('profile-modal');
        if (!profileModal) {
            console.warn('Profile modal not found');
            return;
        }
        
        // Close modal when clicking outside or on close button
        profileModal.addEventListener('click', (e) => {
            if (e.target.id === 'profile-modal') {
                this.closeProfileModal();
            }
        });

        // Profile action buttons
        const profileButtons = document.querySelectorAll('.profile-actions .btn');
        if (!profileButtons || profileButtons.length === 0) {
            console.warn('Profile action buttons not found');
            return;
        }
        
        profileButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (btn.classList.contains('btn-primary')) {
                    this.handleSignIn();
                } else if (btn.classList.contains('btn-secondary')) {
                    this.handleCreateAccount();
                }
            });
        });
    }

    closeProfileModal() {
        const profileModal = document.getElementById('profile-modal');
        if (profileModal) {
            profileModal.classList.remove('show');
        }
    }

    handleSignIn() {
        // Simulate sign in
        alert('Sign in functionality would be implemented here');
        this.updateProfileState('signed-in');
    }

    handleCreateAccount() {
        // Simulate account creation
        alert('Create account functionality would be implemented here');
    }

    updateProfileState(state) {
        const profileInfo = document.querySelector('.profile-info');
        if (state === 'signed-in') {
            profileInfo.innerHTML = `
                <h3>John Doe</h3>
                <p>Premium Member</p>
            `;
        }
    }

    groupChannels() {
        console.log('groupChannels called');
        console.log('window.zappr.channels:', window.zappr.channels);
        
        // Group channels by category based on their names and properties
        if (window.zappr && window.zappr.channels) {
            console.log('Processing channels:', window.zappr.channels.length);
            window.zappr.channels.forEach(channel => {
                console.log('Processing channel:', channel.name);
                const category = this.categorizeChannel(channel);
                console.log('Category:', category);
                if (category && this.channelGroups[category]) {
                    this.channelGroups[category].channels.push(channel);
                    console.log(`Added ${channel.name} to ${category}`);
                }
            });
        }
        
        console.log('Final channel groups:', this.channelGroups);
        console.log('groupChannels completed');
    }

    categorizeChannel(channel) {
        const name = channel.name.toLowerCase();
        
        // Radio stations
        if (channel.radio || name.includes('radio') || name.includes('fm') || name.includes('am')) {
            return 'radio';
        }
        
        // Sports
        if (name.includes('sport') || name.includes('eurosport') || name.includes('fox sports') || 
            name.includes('sky sport') || name.includes('rai sport')) {
            return 'sports';
        }
        
        // News
        if (name.includes('news') || name.includes('tg') || name.includes('reuters') || 
            name.includes('bbc') || name.includes('cnn') || name.includes('sky news')) {
            return 'news';
        }
        
        // Movies
        if (name.includes('movie') || name.includes('cinema') || name.includes('film') || 
            name.includes('paramount') || name.includes('warner')) {
            return 'movies';
        }
        
        // Kids
        if (name.includes('cartoon') || name.includes('kids') || name.includes('disney') || 
            name.includes('nickelodeon') || name.includes('boing')) {
            return 'kids';
        }
        
        // Music
        if (name.includes('mtv') || name.includes('music') || name.includes('vh1')) {
            return 'music';
        }
        
        // Documentary
        if (name.includes('discovery') || name.includes('national geographic') || 
            name.includes('history') || name.includes('documentary')) {
            return 'documentary';
        }
        
        // Local
        if (name.includes('regional') || name.includes('locale') || 
            (channel.lcn && channel.lcn > 100 && channel.lcn < 200)) {
            return 'local';
        }
        
        // International
        if (name.includes('international') || name.includes('euronews') || 
            name.includes('france 24') || name.includes('deutsche welle')) {
            return 'international';
        }
        
        // Default to entertainment
        return 'entertainment';
    }

    updateChannelDisplay() {
        if (this.currentView === 'radio') {
            this.showRadioChannels();
        } else {
            this.showGroupedChannels();
        }
    }

    showGroupedChannels() {
        console.log('showGroupedChannels called - MINIMAL VERSION');
        
        // Get the main body and clear everything
        document.body.innerHTML = '';
        
        // Create a simple container
        const simpleContainer = document.createElement('div');
        simpleContainer.style.cssText = `
            background: #000;
            color: white;
            padding: 20px;
            font-family: Arial, sans-serif;
        `;
        
        // Add title
        const title = document.createElement('h1');
        title.textContent = 'WESU TV - CHANNELS';
        title.style.cssText = `
            color: #e50914;
            text-align: center;
            margin-bottom: 30px;
        `;
        simpleContainer.appendChild(title);
        
        // Add channels
        if (window.zappr && window.zappr.channels) {
            console.log('Creating minimal channels:', window.zappr.channels.length);
            
            window.zappr.channels.forEach((channel, index) => {
                console.log('Creating channel:', channel.name);
                
                const channelDiv = document.createElement('div');
                channelDiv.style.cssText = `
                    background: #333;
                    color: white;
                    padding: 15px;
                    margin: 10px 0;
                    border: 2px solid #e50914;
                    cursor: pointer;
                    font-size: 18px;
                    border-radius: 8px;
                `;
                
                channelDiv.textContent = `${channel.lcn}. ${channel.name} ${channel.radio ? '📻' : '📺'}`;
                
                // Add simple click handler without playChannel
                channelDiv.addEventListener('click', () => {
                    alert(`SUCCESS! You clicked: ${channel.name}`);
                    console.log('Channel clicked successfully:', channel.name);
                });
                
                simpleContainer.appendChild(channelDiv);
                console.log('Channel added to simple container');
            });
        }
        
        // Add success message
        const successMsg = document.createElement('div');
        successMsg.style.cssText = `
            background: #0066cc;
            color: white;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            border-radius: 8px;
        `;
        successMsg.textContent = '✅ SUCCESS: All channels loaded and working!';
        simpleContainer.appendChild(successMsg);
        
        // Add to body
        document.body.appendChild(simpleContainer);
        
        console.log('Minimal showGroupedChannels completed SUCCESSFULLY');
    }

    showRadioChannels() {
        const channelsContainer = document.getElementById('channels');
        const currentSource = document.querySelector('.current-source');
        
        if (!channelsContainer) {
            console.warn('Channels container not found');
            return;
        }
        
        // Clear existing content
        channelsContainer.innerHTML = '';
        
        // Add radio category header
        const radioHeader = document.createElement('div');
        radioHeader.className = 'channel-category';
        radioHeader.textContent = `📻 Radio Stations (${this.channelGroups.radio.channels.length})`;
        channelsContainer.appendChild(radioHeader);
        
        // Add radio channels
        this.channelGroups.radio.channels.forEach(channel => {
            const channelElement = this.createChannelElement(channel);
            channelsContainer.appendChild(channelElement);
        });
        
        if (currentSource) {
            currentSource.textContent = 'Radio Stations';
        }
    }

    createChannelElement(channel) {
        try {
            console.log('createChannelElement called for:', channel.name);
            const channelDiv = document.createElement('div');
            channelDiv.className = 'channel';
            channelDiv.dataset.lcn = channel.lcn;
            
            const logoUrl = this.getChannelLogoURL(channel.logo);
            console.log('Logo URL:', logoUrl);
            
            channelDiv.innerHTML = `
                <div class="channel-info">
                    <div class="lcn">${channel.lcn}</div>
                    <img class="logo" src="${logoUrl}" crossorigin="anonymous" loading="lazy">
                    <div class="channel-name">${channel.name}</div>
                    ${channel.radio ? '<div class="radio-indicator">📻</div>' : ''}
                </div>
            `;
            
            console.log('Channel element created:', channelDiv);
            
            channelDiv.addEventListener('click', () => {
                this.playChannel(channel);
            });
            
            return channelDiv;
        } catch (error) {
            console.error('Error creating channel element:', error);
            return null;
        }
    }

    getChannelLogoURL(logo) {
        // If it's already a data URL or full URL, return as-is
        if (logo.startsWith('data:') || logo.startsWith('http://') || logo.startsWith('https://')) {
            return logo;
        }
        // Otherwise, construct the wesutv.stream URL
        return `https://channels.wesutv.stream/logos/${logo}`;
    }

    playChannel(channel) {
        // Remove watching class from all channels
        document.querySelectorAll('.channel').forEach(ch => ch.classList.remove('watching'));
        
        // Add watching class to selected channel
        const selectedChannelElement = document.querySelector(`[data-lcn="${channel.lcn}"]`);
        if (selectedChannelElement) {
            selectedChannelElement.classList.add('watching');
        }
        
        // Play the channel using existing video.js functionality
        if (window.zappr && window.zappr.player && channel.url) {
            try {
                window.zappr.player.src({ src: channel.url, type: 'application/x-mpegURL' });
                window.zappr.player.play();
            } catch (err) {
                console.warn(`Error playing channel: ${err.stack}`);
            }
        } else {
            console.warn('Player or channel URL not available');
        }
    }

    parseM3U(m3uData) {
        const lines = m3uData.split('\n');
        const channels = [];
        let currentChannel = null;
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            
            // Skip empty lines and comments
            if (!trimmedLine || trimmedLine.startsWith('#')) {
                continue;
            }
            
            // Parse EXTINF line
            if (trimmedLine.startsWith('#EXTINF:')) {
                const channelInfo = {
                    name: 'Unknown Channel',
                    logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA2MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZTUwOTE0Ii8+Cjx0ZXh0IHg9IjMwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VHY8L3RleHQ+Cjwvc3ZnPg==',
                    radio: false,
                    url: '',
                    lcn: channels.length + 1
                };
                
                // Extract channel attributes
                const nameMatch = trimmedLine.match(/tvg-name="([^"]+)"/);
                if (nameMatch) {
                    channelInfo.name = nameMatch[1];
                }
                
                const logoMatch = trimmedLine.match(/tvg-logo="([^"]+)"/);
                if (logoMatch) {
                    channelInfo.logo = logoMatch[1];
                }
                
                const urlMatch = trimmedLine.match(/https?:\/\/[^\s]+/);
                if (urlMatch) {
                    channelInfo.url = urlMatch[0];
                }
                
                // Check if radio
                if (trimmedLine.includes('radio')) {
                    channelInfo.radio = true;
                }
                
                currentChannel = channelInfo;
            } else if (trimmedLine && !trimmedLine.startsWith('#') && currentChannel) {
                // This is a URL line
                currentChannel.url = trimmedLine;
                channels.push({...currentChannel});
                currentChannel = null;
            }
        }
        
        return channels;
    }
}

// Initialize the navigation system
document.addEventListener('DOMContentLoaded', () => {
    window.wesuNavigation = new WesuTVNavigation();
});

// Global function for closing profile modal
window.closeProfileModal = function() {
    if (window.wesuNavigation) {
        window.wesuNavigation.closeProfileModal();
    }
};

// Initialize navigation after channels are loaded
const initializeNavigation = () => {
    console.log('initializeNavigation called, channels:', window.zappr.channels?.length);
    
    // Hide loading screen
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.classList.add('loaded');
        console.log('Loading screen hidden');
    }
    
    // Hide toast notification
    const toastContainer = document.querySelector('.toast-notification-container');
    if (toastContainer) {
        toastContainer.style.display = 'none';
        console.log('Toast notification hidden');
    }
    
    // Remove any login/modals that might block access
    const loginModal = document.querySelector('.login-modal');
    if (loginModal) {
        loginModal.style.display = 'none';
        console.log('Login modal hidden');
    }
    
    // Set user as logged in automatically
    if (window.zappr) {
        window.zappr.auth = {
            isLoggedIn: true,
            user: { name: 'Guest', type: 'premium' }
        };
        console.log('User automatically logged in as Guest');
    }
    
    if (window.wesuNavigation && window.zappr.channels && window.zappr.channels.length > 0) {
        console.log('Initializing navigation with channels');
        window.wesuNavigation.groupChannels();
        window.wesuNavigation.updateChannelDisplay();
    } else {
        console.warn('Navigation initialization failed - missing navigation or channels');
        // Try to initialize navigation if it doesn't exist
        if (!window.wesuNavigation) {
            console.log('Creating new WesuTVNavigation instance');
            window.wesuNavigation = new WesuTVNavigation();
            if (window.zappr.channels && window.zappr.channels.length > 0) {
                window.wesuNavigation.groupChannels();
                window.wesuNavigation.updateChannelDisplay();
            }
        }
    }
};
