const axios = require('axios');

const NOTION_API_URL = "https://api.notion.com/v1/databases/db4ffb466e4f4889b0ee5d309ec1c3fe/query";
const NOTION_API_KEY = "secret_xVKFAspLpkbWkQ7Tct2JmVNQl01mYCMqFv0gzqF2pl2";

async function updateCheckboxByName(userName, newFileString, isChecked) {
  try {
    const headers = getHeaders();

    const response = await axios.post(NOTION_API_URL, {}, {headers}); // 데이터베이스에서 페이지를 조회
    const pages = response.data.results;

    console.log(newFileString);
    newFiles = newFileString.split(',').pop();

    for (const problemName of newFiles) {
      const targetPage = pages.find(page => page.properties.이름.title[0].plain_text === problemName);

      console.log(targetPage);

      if (targetPage) {
        const pageId = targetPage.id;

        // 체크박스 업데이트
        const updateUrl = `https://api.notion.com/v1/pages/${pageId}`;
        const updateData = {
          "properties": {
            [userName]: {
              "checkbox": true
            }
          }
        };

        await axios.patch(updateUrl, updateData, {headers});
        console.log(`"${problemName}"의 체크박스를 ${isChecked ? '체크' : '체크 해제'}했습니다.`);
      } else {
        console.log(`"${problemName}"라는 이름을 가진 페이지를 찾을 수 없습니다.`);
      }
    }
  } catch (error) {
    console.error('오류 발생:', error.response ? error.response.data : error.message);
  }
}

function getHeaders() {
  return {
    "Authorization": `Bearer ${NOTION_API_KEY}`,
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28"
  };
}



const USER_NAME = process.env.USER_NAME;
const NEW_FILES = process.env.NEW_FILES;

updateCheckboxByName(USER_NAME, NEW_FILES, true);