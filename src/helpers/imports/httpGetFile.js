import url from "url";
import https from "https";
import { create } from "ssl-root-cas";
// import { create } from "ssl-root-cas/latest";
https.globalAgent.options.ca = create();
const httpx = {
  http: require("http"),
  https
};

export const cthHttpGetFile = options => {
  return new Promise((resolve, reject) => {
    const path = url.parse(options.path, true);

    console.log(path);
    const req = httpx[path.protocol.slice(0, -1)].get(
      path.href + options.filename,
      function(res) {
        var b = [];

        res.on("data", function(data) {
          b.push(data);
        });

        res.on("end", function() {
          if (res.statusCode == 200) {
            resolve(Buffer.concat(b).toString());
          } else {
            reject(
              Error(
                "href=" +
                  path.href +
                  options.filename +
                  "; statusCode=" +
                  res.statusCode
              )
            );
          }
        });

        res.on("error", function(err) {
          reject(err);
        });
      }
    );

    req.on("error", function(err) {
      reject(err);
    });

    req.end();
  });
};
