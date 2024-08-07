const axios = require('axios');

const NOTION_API_DATABASE_URL = "https://api.notion.com/v1/databases/db4ffb466e4f4889b0ee5d309ec1c3fe/query";
const NOTION_API_KEY = "secret_xVKFAspLpkbWkQ7Tct2JmVNQl01mYCMqFv0gzqF2pl2";
const NOTION_API_PAGE_URL = "https://api.notion.com/v1/pages/";

async function run(userName, fileString) {
  try {
    const pages = await getPages();

    filePaths = extractFilePathsFromString(fileString);

    for (const filePath of newFiles) {
      const problemName = getProblemName(filePath);
      const targetPage = getTargetPage(pages, problemName);

      if(isEmptyTargetPage(targetPage)){
        console.log(`"${problemName}"라는 이름을 가진 페이지를 찾을 수 없습니다.`);
        continue;
      }

      await updateCheckbox(targetPage, userName);

      console.log(`"${problemName}"의 체크박스를 '체크'했습니다.`);
    }
  } catch (error) {
    console.error('오류 발생:', error.response ? error.response.data : error.message);
  }
}

async function updateCheckbox(targetPage, userName) {
  const updateUrl = getUpdateUrl(targetPage);
  const updateData = getUpdateData(userName);
  const headers = getHeaders();

  await axios.patch(updateUrl, updateData, {headers});
}

function extractFilePathsFromString(fileString) {
  const filePaths =  fileString.split(',');
  filePaths.pop();

  return filePaths;
}

function extractFileNameFromPath(filePath) {
  const fileNameSplit = filePath.split('/');
  const fileName = fileNameSplit[fileNameSplit.length - 1];

  return fileName;
}

function getTargetPage(pages, problemName) {
  return pages.find(page => page.properties.이름.title[0].plain_text === problemName);
}

function isEmptyTargetPage(targetPage) {
  return targetPage === undefined;
}

function getUpdateUrl(targetPage) {
  return NOTION_API_PAGE_URL + targetPage.pageId;
}

function getUpdateData(userName) {
  return {
    "properties": {
      [userName]: {
        "checkbox": true
      }
    }
  };
}

async function getPages() {
  const headers = getHeaders();
  const response = await axios.post(NOTION_API_DATABASE_URL, {}, {headers});
  const pages = response.data.results;

  return pages;
}

function getProblemName(filePath) {
  const fileName = extractFileNameFromPath(filePath);
  const problemName = fileName.split('.')[0];

  return problemName;
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

run(USER_NAME, NEW_FILES);