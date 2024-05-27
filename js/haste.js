class HasteUpd {
  constructor(dropZone, body) {
    this.dropZone = document.querySelector(dropZone);
    this.body = document.querySelector(body);

    this.btn = document.createElement("button");
    this.customOutput = document.createElement("div");

    this.init = async () => {
      await this.appendBtn();
      await this.copyFunc();
      await this.appendCustomOutput();
    };

    this.init();
  }

  appendBtn() {
    this.btn.innerText = "copy";
    this.btn.setAttribute("class", "copy-btn");
    this.dropZone.appendChild(this.btn);
  }

  appendCustomOutput() {
    this.customOutput.setAttribute("id", "custom-list");
    this.body.appendChild(this.customOutput);
  }

  copyFunc() {
    let links = "";

    this.btn.onclick = () => {
      const inputs = document.querySelectorAll("dt input");
      const customInputs = document.querySelectorAll("dt input");

      inputs.forEach((input) => {
        links += `${input.value}\n`;
      });

      navigator.clipboard.writeText(links);
      links = "";
    };
  }
}

if (window.location.href.includes("https://haste.ftband.net/img")) {
  new HasteUpd("#drop_zone", "body");
}

const request = (base64) => {
  const xhttp = new XMLHttpRequest();

  xhttp.onreadystatechange = () => {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      var doc_id = JSON.parse(xhttp.responseText).key;
      var doc_url = [window.location.href, "?i=", doc_id].join("");
      textarea = [
        `<div class="textarea"><dt><text>Your Link:</text></dt><dt><img src="data:image/png;base64, ${base64}"><input readonly="" onfocus="this.select()" value=${doc_url} type="text"></dt></div>`,
      ].join("");

      document.querySelector("#custom-list").innerHTML += [textarea].join("");

      const texts = document.querySelectorAll("#custom-list  div text");

      const imgs = document.querySelectorAll("img");

      if (texts) {
        texts.forEach((item) => {
          item.style = "color:white;display:block;margin:30px 0";
        });
      }

      if (imgs) {
        imgs.forEach((item) => {
          item.style =
            "max-width:200px;display:block;max-height:400px:padding:25px;margin:10px auto";
        });
      }
    }
  };
  xhttp.open("POST", "/documents", true);
  xhttp.send(base64);
};

document.onpaste = async (evt) => {
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const Main = async () => {
    const dT = evt.clipboardData || window.clipboardData;
    const f = dT.files[0];

    const result = await toBase64(f);

    await request(result.substr(result.indexOf(",") + 1));
  };

  Main();
};
