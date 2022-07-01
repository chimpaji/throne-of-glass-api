//will crawl throught website and seed data into db
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import cheerio from 'cheerio';
const prisma = new PrismaClient();
const getCharacterpageNames = async () => {
  const url = 'https://throneofglass.fandom.com/wiki/Category:Characters';

  const { data } = await axios.get(url);
  //   console.log(data);

  const $ = cheerio.load(data);
  //characters name element is in <ul .category-page__members-for-char>
  const categories = $('ul.category-page__members-for-char');
  const characterPageNames = [];
  for (let i = 0; i < categories.length; i++) {
    const ul = categories[i];
    const charactersLi = $(ul).find('li.category-page__member');
    for (let j = 0; j < charactersLi.length; j++) {
      const li = charactersLi[j];
      const path =
        $(li).find('a.category-page__member-link').attr('href') || '';
      const name = path?.replace('/wiki/', '');
      characterPageNames.push(name);
    }
  }
  return characterPageNames;
};

const getCharacterInfo = async (characterName: string) => {
  const baseUrl = 'https://throneofglass.fandom.com/wiki/' + characterName;
  const { data } = await axios.get(`${baseUrl}`);
  const $ = cheerio.load(data);
  const name = $('[data-source=name]').text() || characterName.replace('_', '');
  const image = $('[data-source=image]').children().attr('href');
  const species = $('[data-source=species] > div.pi-data-value.pi-font').text();

  return { name, image, species };
};

const loadCharactersToDB = async () => {
  const characterPageNames = await getCharacterpageNames();
  //   const characterInfoArr = [];
  //   for (let i = 0; i < characterPageNames.length; i++) {
  //     const characterInfo = await getCharacterInfo(characterPageNames[i]);
  //     characterInfoArr.push(characterInfo);
  //   }
  //   console.log(characterInfoArr);

  //will use Promise.all to run all get request in parallel
  const characterInfoPromises = characterPageNames.map((characterName) =>
    getCharacterInfo(characterName)
  );
  const characters = await Promise.all(characterInfoPromises);
  const formattedCharacters = characters.map((character, i) => ({
    id: i,
    ...character,
  }));
  try {
    const response = await prisma.character.createMany({
      data: formattedCharacters,
    });
    console.log(response);
  } catch (errors) {
    console.log(errors);
  }
};

const deleteAllCharacters = async () => {
  const response = await prisma.character.deleteMany({});
  console.log(response);
};

loadCharactersToDB();
// deleteAllCharacters();
