const puppeteer = require('puppeteer');
const css = `
#ambHeader, 
header[role="banner"], 
div[data-uranus-component="blogHeaderNav"], 
.skin-blogSubB, 
#js-snews, 
#js-bigfooter, 
.bfl-official_safety, 
#ambFooter, 
div[data-uranus-component="mainWidget"], 
ul[data-uranus-component="paging"], 
[data-uranus-component="blogFooterNav"], 
[data-uranus-component="entryPaging"], 
[data-uranus-component="entryFooter"] {
  display:none;
}

[data-uranus-layout="columnC"] [data-uranus-layout="content"] {
  padding-left: 0;
}
`;

(async() => {
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();

    async function nextUrl() {
      return await page.evaluate(() => {
        let nextPageLink = $('[data-uranus-component="entryPagingNext"]');
        if (nextPageLink.length == 0) {
          return null;
        }
        return nextPageLink[0].href;
      });
    }

    async function savePost(url) {
      await page.goto(url);
      await page.addStyleTag({content:css});
      let entryData = await page.evaluate(() => {
        return {
          title: $('article[data-unique-entry-title]')[0].getAttribute('data-unique-entry-title'),
          date: $('time')[0].getAttribute('datetime'),
          id: $('article[data-unique-entry-id]')[0].getAttribute('data-unique-entry-id')
        };
      });
      console.log(entryData.date, entryData.id, entryData.title);
      await page.pdf({
        path: `./out/pdf/ariyasu-sd-${entryData.date}-entry-${entryData.id}.pdf`,
        printBackground: true,
      });
    }

    let url = 'https://ameblo.jp/ariyasu-sd/entry-12346028211.html';
    let i = 0;
    do {
      await savePost(url);
      i++;
      if (i >= 10) {
        break;
      }
      url = await nextUrl();
    } while (url != null && url !== '');
    console.log('出力完了');
  } catch(e) {
    console.error('なんかダメだ', e);
  } finally {
    browser.close();
  }
})();