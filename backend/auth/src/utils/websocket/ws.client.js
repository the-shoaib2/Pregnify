import WebSocket from 'ws';

class WebSocketClient {
    constructor(url, token) {
        this.url = url;
        this.token = token;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.connect();
    }

    connect() {
        this.ws = new WebSocket(this.url, [this.token]);
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };

        this.ws.onclose = () => {
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                setTimeout(() => {
                    this.reconnectAttempts++;
                    this.connect();
                }, 1000 * Math.pow(2, this.reconnectAttempts));
            }
        };
    }

    handleMessage(data) {
        switch (data.type) {
            case 'ACTIVITY_UPDATED':
                this.handleActivityUpdate(data);
                break;
            case 'SECURITY_ALERT':
                this.handleSecurityAlert(data);
                break;
            case 'NOTIFICATION_UPDATED':
                this.handleNotificationUpdate(data);
                break;
        }
    }

    send(data) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }
}

export default WebSocketClient; 