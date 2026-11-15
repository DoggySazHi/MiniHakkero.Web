let connectedDevice = null;

const selectionModalDOM = document.getElementById("selection-modal");
const requestSerialPortDOM = document.getElementById("request-serial-port");
const statusDOM = document.getElementById("status");

if (!navigator.serial) {
    // Web Serial not supported :(
    document.getElementById("no-webserial-modal").style.display = "block";
} else {
    selectionModalDOM.style.display = "block";
}

requestSerialPortDOM.addEventListener("click", requestSerialPort);
listSerialPorts();

async function listSerialPorts() {
    const ports = await navigator.serial.getPorts();
    const portList = document.getElementById("serial-port-list");
    document.getElementById("serial-port-count").textContent = ports.length;

    portList.innerHTML = "";
    ports.forEach((port) => {
        const portInClosure = port;
        const portItem = document.createElement("li");
        const portButton = document.createElement("button");
        portButton.textContent = JSON.stringify(portInClosure.getInfo());
        portButton.addEventListener("click", async () => {
            await portInClosure.open({ baudRate: 115200 });
            connectedDevice = portInClosure;
            connectedLoop(); // do NOT await
        });
        
        portItem.appendChild(portButton);
        portList.appendChild(portItem);
    });
}

async function requestSerialPort() {
    try {
        await navigator.serial.requestPort([{ usbVendorId: 0x2e8a }]);
        listSerialPorts();
    } catch (error) {
        console.error("Failed to request serial port:", error);
    }
}

async function connectedLoop() {
    if (!connectedDevice) {
        return;
    }

    statusDOM.textContent = "Connected";
    selectionModalDOM.style.display = "none";

    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = connectedDevice.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();

    while (connectedDevice.readable) {
        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    break;
                }
                // TODO do something with this data
                // console.log(value);
            }
        } finally {
            reader.releaseLock();
        }
    }

    await readableStreamClosed.catch(() => {});

    statusDOM.textContent = "Disconnected";
    selectionModalDOM.style.display = "block";
}

async function write(data) {
    if (!connectedDevice) {
        return;
    }

    if (!data.endsWith("\n")) {
        data += "\n";
    }

    const dataBytes = new TextEncoder().encode(data);

    const writer = connectedDevice.writable.getWriter();
    try {
        await writer.write(dataBytes);
    } finally {
        writer.releaseLock();
    }
}

async function disconnect() {
    if (!connectedDevice) {
        return;
    }

    await connectedDevice.close();
    connectedDevice = null;
}
