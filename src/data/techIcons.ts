// Logos oficiales a color de cada tecnología (en src/assets/logos). Lo que no
// tiene logo (protocolos, conceptos) no se registra y el badge se queda solo
// con el texto.
import angular from "../assets/logos/angular.svg";
import androidstudio from "../assets/logos/androidstudio.svg";
import bash from "../assets/logos/bash.svg";
import cisco from "../assets/logos/cisco.svg";
import claude from "../assets/logos/claude.svg";
import copilot from "../assets/logos/copilot.svg";
import csharp from "../assets/logos/csharp.svg";
import css3 from "../assets/logos/css3.svg";
import dotnet from "../assets/logos/dotnet.svg";
import excel from "../assets/logos/excel.svg";
import fastapi from "../assets/logos/fastapi.svg";
import figma from "../assets/logos/figma.svg";
import flask from "../assets/logos/flask.svg";
import git from "../assets/logos/git.svg";
import github from "../assets/logos/github.svg";
import html5 from "../assets/logos/html5.svg";
import java from "../assets/logos/java.svg";
import javascript from "../assets/logos/javascript.svg";
import kotlin from "../assets/logos/kotlin.svg";
import linux from "../assets/logos/linux.svg";
import mysql from "../assets/logos/mysql.svg";
import nodejs from "../assets/logos/nodejs.svg";
import npm from "../assets/logos/npm.svg";
import openai from "../assets/logos/openai.svg";
import powerpoint from "../assets/logos/powerpoint.svg";
import powerbi from "../assets/logos/powerbi.svg";
import python from "../assets/logos/python.svg";
import react from "../assets/logos/react.svg";
import sqlserver from "../assets/logos/sqlserver.svg";
import tomcat from "../assets/logos/tomcat.svg";
import typescript from "../assets/logos/typescript.svg";
import visualstudio from "../assets/logos/visualstudio.svg";
import vite from "../assets/logos/vite.svg";
import vscode from "../assets/logos/vscode.svg";
import word from "../assets/logos/word.svg";

// Sobre el fondo oscuro del tema los logos negros se pierden: "white" los pinta de blanco
// y "lift" aclara los tonos oscuros sin cambiar su color.
const FILTERS = { white: "brightness(0) invert(1)", lift: "brightness(1.9)" };

export type TechIconDef = { img: string; filter?: string };

// [patrón a buscar en el nombre del badge ya en minúsculas, ícono]
// El orden importa: los patrones más específicos van primero (ej. "github copilot" antes que "github").
const registry: [string, TechIconDef][] = [
  ["github copilot", { img: copilot, filter: FILTERS.white }],
  ["copilot", { img: copilot, filter: FILTERS.white }],
  ["github", { img: github, filter: FILTERS.white }],
  ["git", { img: git }],
  ["fastapi", { img: fastapi }],
  ["flask", { img: flask, filter: FILTERS.white }],
  ["python", { img: python }],
  ["angular", { img: angular }],
  ["react", { img: react }],
  ["asp.net", { img: dotnet }],
  [".net", { img: dotnet }],
  ["c#", { img: csharp }],
  ["mysql", { img: mysql, filter: FILTERS.lift }],
  ["sql server", { img: sqlserver, filter: FILTERS.lift }],
  ["t-sql", { img: sqlserver, filter: FILTERS.lift }],
  ["power bi", { img: powerbi }],
  ["excel", { img: excel }],
  ["javascript", { img: javascript }],
  ["html", { img: html5 }],
  ["css", { img: css3 }],
  ["servlets", { img: java, filter: FILTERS.lift }],
  ["jsp", { img: java, filter: FILTERS.lift }],
  ["java web", { img: java, filter: FILTERS.lift }],
  ["java", { img: java, filter: FILTERS.lift }],
  ["apache tomcat", { img: tomcat }],
  ["cisco", { img: cisco }],
  ["claude", { img: claude }],
  ["chatgpt", { img: openai, filter: FILTERS.white }],
  ["visual studio code", { img: vscode }],
  ["vs code", { img: vscode }],
  ["visual studio", { img: visualstudio }],
  ["node.js", { img: nodejs }],
  ["typescript", { img: typescript }],
  ["vite", { img: vite }],
  ["kotlin", { img: kotlin }],
  ["android studio", { img: androidstudio }],
  ["figma", { img: figma }],
  ["npm", { img: npm }],
  ["powerpoint", { img: powerpoint }],
  ["word", { img: word, filter: FILTERS.lift }],
  ["linux", { img: linux }],
  ["bash", { img: bash, filter: FILTERS.lift }],
];

export function techIconFor(label: string): TechIconDef | undefined {
  const normalized = label.toLowerCase();
  return registry.find(([pattern]) => normalized.includes(pattern))?.[1];
}
