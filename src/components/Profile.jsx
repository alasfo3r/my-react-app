// src/components/Profile.jsx
import React, { useEffect, useState, useMemo } from 'react';
// NOTE: use this path to avoid the "useQuery not found" error with some bundles
import { useQuery } from '@apollo/client/react/hooks';
import XPByProjectChart from './Graphs/XPByProjectChart';

import {
  GET_USER_INFO,
  GEt_Total_XPInKB,
  GET_PROJECTS_WITH_XP,
  GET_PROJECTS_PASS_FAIL,
  GET_LATEST_PROJECTS_WITH_XP, // kept in case you still need elsewhere
  GET_PISCINE_GO_XP,
  GET_PISCINE_JS_XP,
  GET_PROJECT_XP,
  GET_FINISHED_PROJECTS,
} from '../graphql/queries';

import PassFailChart from './Graphs/PassFailChart';

function Profile() {
  // 1) Who am I?
  const { data: userData, loading: userLoading, error: userError } = useQuery(GET_USER_INFO);

  // 2) userId once available
  const [userId, setUserId] = useState(null);
  useEffect(() => setUserId(userData?.user?.[0]?.id ?? null), [userData]);

  // 3) Remaining queries (skip until userId)
  const common = { skip: !userId, variables: { userId } };

  const { data: xpdata, loading: xpLoading, error: xpError } =
    useQuery(GEt_Total_XPInKB, common);

  const { data: piscineGoXPData, loading: piscineGoXPLoading, error: piscineGoXPError } =
    useQuery(GET_PISCINE_GO_XP, common);

  const { data: piscineJsXPData, loading: piscineJsXPLoading, error: piscineJsXPError } =
    useQuery(GET_PISCINE_JS_XP, common);

  const { data: projectXPData, loading: projectXPLoading, error: projectXPError } =
    useQuery(GET_PROJECT_XP, common);

  // For finished list
  const { data: projectsXPData, loading: projectsLoading, error: projectsError } =
    useQuery(GET_PROJECTS_WITH_XP, common);

  const { data: finishedData, loading: finishedLoading, error: finishedError } =
    useQuery(GET_FINISHED_PROJECTS, common);

  // For charts
  const { data: passFailData, loading: passFailLoading, error: passFailError } =
    useQuery(GET_PROJECTS_PASS_FAIL, common);

  // (We no longer use latestProjects for the chart; totals come from finished projects)
  useQuery(GET_LATEST_PROJECTS_WITH_XP, common);

  // 4) Safe computed values
  const piscineGoXPTotal = useMemo(() => {
    const rows = piscineGoXPData?.transaction ?? [];
    return rows.reduce((acc, tx) => acc + (tx?.amount ?? 0), 0) / 1000;
  }, [piscineGoXPData]);

  const piscineJsXPTotal = useMemo(() => {
    const sum = piscineJsXPData?.transaction_aggregate?.aggregate?.sum?.amount ?? 0;
    return sum / 1000;
  }, [piscineJsXPData]);

  const projectXPTotal = useMemo(() => {
    const sum = projectXPData?.transaction_aggregate?.aggregate?.sum?.amount ?? 0;
    return sum / 1000;
  }, [projectXPData]);

  const totalXPInKB = useMemo(() => {
    const total = xpdata?.transaction_aggregate?.aggregate?.sum?.amount ?? 0;
    return (total / 1000).toFixed(2);
  }, [xpdata]);

  const { passCount, failCount } = useMemo(() => {
    const rows = passFailData?.progress ?? [];
    return {
      passCount: rows.filter((r) => r?.grade != null && r.grade >= 1).length,
      failCount: rows.filter((r) => r?.grade != null && r.grade < 1).length,
    };
  }, [passFailData]);

  // 5) Finished Projects (date from Hasura earliest PASS; XP from transactions; fallback to latest XP date)
  const projects = useMemo(() => {
    const xpRows = projectsXPData?.transaction ?? [];
    const finishedRows = finishedData?.progress ?? [];

    // Sum positive XP and remember latest positive XP timestamp
    const totalsById = new Map();
    const lastXpDateById = new Map();
    const nameById = new Map();

    for (const tx of xpRows) {
      const objectId = tx?.objectId ?? tx?.object?.id ?? null;
      if (!objectId) continue;
      const amt = Number(tx?.amount ?? 0);
      const t = tx?.createdAt ? new Date(tx.createdAt) : null;
      const name = tx?.object?.name || 'Unknown Project';
      nameById.set(objectId, name);

      if (amt > 0) {
        totalsById.set(objectId, (totalsById.get(objectId) || 0) + amt / 1000); // KB (÷1000)
        if (t && (!lastXpDateById.get(objectId) || t > lastXpDateById.get(objectId))) {
          lastXpDateById.set(objectId, t);
        }
      }
    }

    // Hasura returns earliest PASS per objectId thanks to distinct_on + ascending order
    const result = [];
    const included = new Set();

    for (const pr of finishedRows) {
      const objectId = pr?.objectId ?? pr?.object?.id ?? null;
      if (!objectId || included.has(objectId)) continue;
      included.add(objectId);

      const name = pr?.object?.name || nameById.get(objectId) || 'Unknown Project';
      const totalKB = totalsById.get(objectId) || 0;
      if (totalKB <= 0) continue; // hide projects with no positive XP

      const completedAt =
        pr?.updatedAt || pr?.createdAt || lastXpDateById.get(objectId)?.toISOString() || null;

      result.push({ id: objectId, name, totalKB, createdAt: completedAt });
    }

    result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return result;
  }, [projectsXPData, finishedData]);

  // Slice the list for the chart (show latest 12 finished projects by our computed order)
  const projectsForChart = useMemo(() => projects.slice(0, 12), [projects]);

  // 6) UI guards
  if (userLoading) return <div className="text-center text-indigo-300 font-bold">Loading user…</div>;
  if (userError)   return <div className="text-center text-amber-400 font-bold">Error: {String(userError.message || userError)}</div>;
  if (!userId)     return <div className="text-center text-indigo-300 font-bold">Resolving account…</div>;

  const anyLoading =
    xpLoading ||
    projectsLoading ||
    passFailLoading ||
    piscineGoXPLoading ||
    piscineJsXPLoading ||
    projectXPLoading ||
    finishedLoading;

  if (anyLoading) return <div className="text-center text-indigo-300 font-bold">Loading…</div>;

  const anyError =
    xpError ||
    projectsError ||
    passFailError ||
    piscineGoXPError ||
    piscineJsXPError ||
    projectXPError ||
    finishedError;

  if (anyError) {
    const msg = (anyError && anyError.message) || String(anyError);
    return <div className="text-center text-amber-400 font-bold">Error loading data: {msg}</div>;
  }

  const currentUser = userData?.user?.[0] ?? {};

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  };

  // 7) Render
  return (
    <div className="profile-bg">
      <div className="container mx-auto p-4">
        <header className="flex justify-between items-center mb-6 card p-4">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-emerald-500 bg-clip-text text-transparent">
            School Profile
          </h1>
          <button
            onClick={handleLogout}
            className="bg-fuchsia-500 text-white px-4 py-2 rounded-xl shadow hover:bg-fuchsia-600 transition"
          >
            Logout
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="card overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-purple-600 text-white">
                <h3 className="text-lg leading-6 font-medium">Basic Information</h3>
              </div>
              <div className="border-t border-white/10">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 py-5">
                  <div className="flex items-center space-x-4 col-span-2 sm:col-span-1">
                    <div className="h-20 w-20 rounded-full bg-purple-500 flex items-center justify-center text-2xl font-bold text-white">
                      {currentUser.firstName && currentUser.lastName
                        ? `${currentUser.firstName[0]}${currentUser.lastName[0]}`
                        : currentUser.login?.slice(0, 2)?.toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-100">
                        {(currentUser.firstName || '') + ' ' + (currentUser.lastName || '')}
                      </h2>
                      <p className="text-purple-300">@{currentUser.login}</p>
                    </div>
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <p><span className="font-semibold text-purple-300">ID:</span> {currentUser.id}</p>
                    <p><span className="font-semibold text-purple-300">Email:</span> {currentUser.email}</p>
                    <p>
                      <span className="font-semibold text-purple-300">Started Program:</span>{' '}
                      {currentUser.updatedAt ? new Date(currentUser.updatedAt).toLocaleDateString() : '—'}
                    </p>
                    <p>
                      <span className="font-semibold text-purple-300">Account Created:</span>{' '}
                      {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : '—'}
                    </p>
                  </div>
                </dl>
              </div>
            </div>

            {/* XP Summary */}
            <div className="card overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-purple-600 text-white">
                <h3 className="text-lg leading-6 font-medium">XP Summary</h3>
              </div>
              <div className="border-t border-white/10 px-4 py-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="col-span-2 sm:col-span-3">
                    <p className="text-lg font-semibold text-purple-300">Total XP: {totalXPInKB} KB</p>
                  </div>
                  <div>
                    <p className="font-semibold text-purple-300">Piscine Go XP</p>
                    <p className="text-slate-200">{piscineGoXPTotal.toFixed(2)} KB</p>
                  </div>
                  <div>
                    <p className="font-semibold text-purple-300">Piscine JS XP</p>
                    <p className="text-slate-200">{piscineJsXPTotal.toFixed(2)} KB</p>
                  </div>
                  <div>
                    <p className="font-semibold text-purple-300">Project XP</p>
                    <p className="text-slate-200">{projectXPTotal.toFixed(2)} KB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Finished Projects */}
          <div className="card overflow-hidden">
            <div className="px-4 py-5 sm:px-6 bg-purple-600 text-white">
              <h3 className="text-lg leading-6 font-medium">Finished Projects</h3>
            </div>
            <div className="border-t border-white/10">
              <div className="finished-projects-container px-4 py-5 h-[400px] overflow-y-auto">
                {projects.map((project, index) => (
                  <div key={project.id || project.name} className="mb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-100">{project.name}</h3>
                        <p className="text-sm text-slate-300">
                          Completed: {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : '—'}
                        </p>
                      </div>
                      <span className="badge">{project.totalKB.toFixed(2)} KB</span>
                    </div>
                    {index < projects.length - 1 && <hr className="my-2 border-white/10" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 w-full">
            <h2 className="text-xl font-bold mb-4 text-purple-300">XP by Latest 12 Projects</h2>
            <div className="w-full h-[500px]">
              <XPByProjectChart projects={projectsForChart} />
            </div>
          </div>
          <div className="card p-6 w-full">
            <h2 className="text-xl font-bold mb-4 text-purple-300">Projects PASS and FAIL Ratio</h2>
            <div className="flex justify-center items-center">
              <PassFailChart passCount={passCount} failCount={failCount} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
