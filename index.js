const axios = require('axios');

const NOTION_API_DATABASE_URL = "https://api.notion.com/v1/databases/32be5ff7f3e943d2a3711c2639ed62d6/query";
const NOTION_API_KEY = "secret_haIz3bCSJh9W29Od6jKCOlyC2qLajt99KzE6qchX65y";
const NOTION_API_PAGE_URL = "https://api.notion.com/v1/pages/";
const USER_NAME = process.env.USER_NAME;
const NEW_FILES = process.env.NEW_FILES;

async function run(userName, fileString) {
  try {
    const pages = await getPages();

    filePaths = extractFilePathsFromString(fileString);

    for (const filePath of filePaths) {
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
  const filePathSplit = filePath.split('/');
  const fileName = filePathSplit[filePathSplit.length - 1];

  return fileName;
}

function getTargetPage(pages, problemName) {
  return pages.find(page => page.properties.번호.rich_text[0].plain_text === problemName);
}

function isEmptyTargetPage(targetPage) {
  return targetPage === undefined;
}

function getUpdateUrl(targetPage) {
  return NOTION_API_PAGE_URL + targetPage.id;
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

run(USER_NAME, NEW_FILES);