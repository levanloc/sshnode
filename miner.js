const fs = require('fs');
const readline = require('readline');
const { NodeSSH } = require('node-ssh');

// Danh sách thông tin VPS
const vpsList = [];

// Đọc dữ liệu từ file
const rl = readline.createInterface({
  input: fs.createReadStream('data.txt'),
  crlfDelay: Infinity,
});

// Đọc dòng từ file và thêm vào danh sách
rl.on('line', (line) => {
  // Tách thông tin VPS từ dòng trong file
  const [usernameHost, port] = line.split('-p');
  const [username, host] = usernameHost.split('@');
  const password = 'Vietnam123@@@';

  // Kiểm tra định dạng của dòng
  if (host && port) {
    // Thêm thông tin VPS vào danh sách
    vpsList.push({
      host: host.trim(),
      port: port.trim(),
      username: username.trim(),
      password,
    });
  } else {
    console.log(`Invalid format in line: ${line}`);
  }
});

// Khi đã đọc hết file, thực hiện kết nối và chạy lệnh
rl.on('close', async () => {
  for (const vps of vpsList) {
    const { host, port, username, password } = vps;

    const ssh = new NodeSSH();

    try {
      await ssh.connect({
        host,
        port,
        username,
        tryKeyboard: true,
        password,
      });

      console.log(`SSH connection successful to ${host}:${port}`);

      const commands = [
        'sudo su',
        'wget https://github.com/xmrig/xmrig/releases/download/v6.19.2/xmrig-6.19.2-linux-x64.tar.gz',
        'tar xavf xmrig-6.19.2-linux-x64.tar.gz',
        'cd xmrig-6.19.2',
        'screen -R',
        './xmrig -o zephyr.miningocean.org:5462 -a rx -k -u ZEPHYR2Nk4PMWboF1H3qMXdTGp9mj9ddp7Zrkek5X7LEgFPtoohUw5tMcdAixPbzkZHsJqoBcquZsYfJGccsQde5VGfrzpvM8LW3a -p test -t 92',
        'exit', // Để đảm bảo kết thúc session sau khi thực hiện lệnh
      ];

      for (const command of commands) {
        console.log(`Executing command on ${host}:${port}: ${command}`);
        const response = await ssh.execCommand(command);
        console.log(`OUTPUT (${host}:${port}): ${response.stdout}`);
      }

      console.log(`Commands executed successfully on ${host}:${port}`);
    } catch (error) {
      console.error(`Error connecting to ${host}:${port}: ${error.message}`);
    } finally {
      ssh.dispose(); // Disconnect after each iteration
    }
  }
});
