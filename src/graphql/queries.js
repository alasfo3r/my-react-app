import { gql } from '@apollo/client';

// Who am I
export const GET_USER_INFO = gql`
  query GetUserDetails {
    user {
      id
      login
      email
      createdAt
      updatedAt
      firstName
      lastName
    }
  }
`;

// Total XP (KB = amount / 1000 done in UI)
export const GEt_Total_XPInKB = gql`
  query GetTotalXPInKB($userId: Int!) {
    transaction_aggregate(
      where: { userId: { _eq: $userId }, type: { _eq: "xp" } }
    ) {
      aggregate { sum { amount } }
    }
  }
`;

// Piscine Go XP
export const GET_PISCINE_GO_XP = gql`
  query GetPiscineGoXP($userId: Int!) {
    transaction(
      where: {
        userId: { _eq: $userId }
        type: { _eq: "xp" }
        path: { _like: "%bh-piscine%" }
      }
    ) { amount }
  }
`;

// Piscine JS XP
export const GET_PISCINE_JS_XP = gql`
  query GetPiscineJsXP($userId: Int!) {
    transaction_aggregate(
      where: {
        userId: { _eq: $userId }
        type: { _eq: "xp" }
        event: { path: { _like: "%piscine-js%" } }
      }
    ) {
      aggregate { sum { amount } }
    }
  }
`;

// Project XP (bh-module)
export const GET_PROJECT_XP = gql`
  query {
    transaction_aggregate(
      where: {
        event: { path: { _eq: "/bahrain/bh-module" } }
        type: { _eq: "xp" }
      }
    ) {
      aggregate { sum { amount } }
    }
  }
`;

// All project XP transactions (for totals and latest xp dates)
export const GET_PROJECTS_WITH_XP = gql`
  query GetProjectsAndXP($userId: Int!) {
    transaction(
      where: {
        userId: { _eq: $userId }
        type: { _eq: "xp" }
        object: { type: { _eq: "project" } }
      }
      order_by: { createdAt: asc }
    ) {
      id
      objectId
      object { id name }
      amount
      createdAt
    }
  }
`;

// Earliest PASS row per project (one row per object)
export const GET_FINISHED_PROJECTS = gql`
  query GetFinishedProjects($userId: Int!) {
    progress(
      where: {
        userId: { _eq: $userId }
        grade: { _gte: 1 }
        object: { type: { _eq: "project" } }
      }
      distinct_on: [objectId]
      order_by: [
        { objectId: asc }
        { updatedAt: asc }
        { createdAt: asc }
      ]
    ) {
      objectId
      object { id name }
      createdAt
      updatedAt
      grade
    }
  }
`;

// For pass/fail ratio chart
export const GET_PROJECTS_PASS_FAIL = gql`
  query GetProjectsPassFail($userId: Int!) {
    progress(
      where: { userId: { _eq: $userId }, object: { type: { _eq: "project" } } }
    ) { grade }
  }
`;

// Latest 12 project XP rows (for bar chart)
export const GET_LATEST_PROJECTS_WITH_XP = gql`
  query GetLatestProjectsAndXP($userId: Int!) {
    transaction(
      where: {
        userId: { _eq: $userId }
        type: { _eq: "xp" }
        object: { type: { _eq: "project" } }
      }
      order_by: { createdAt: desc }
      limit: 12
    ) {
      id
      objectId
      object { id name }
      amount
      createdAt
    }
  }
`;
