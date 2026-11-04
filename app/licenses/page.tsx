"use client"

import { useEffect, useState } from "react"
import { LicenseData, getLicenseGroups } from "@/lib/licenses/parser"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"
import { asset } from "@/lib/site"

export default function LicensesPage() {
  const [licenseData, setLicenseData] = useState<LicenseData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [licenseTypeFilter, setLicenseTypeFilter] = useState<string | null>(null)
  const [expandedGroup, setExpandedGroup] = useState<string[]>([])

  useEffect(() => {
    async function fetchLicenses() {
      try {
        const response = await fetch(asset("/data/licenses.json"))
        if (!response.ok) {
          throw new Error("Failed to fetch licenses data")
        }
        const data = await response.json()
        setLicenseData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        console.error("Error fetching license data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchLicenses()
  }, [])

  const licenseTypes = Object.values(licenseData)
    .map((item) => item.licenses)
    .filter((license, index, self) => self.indexOf(license) === index)
    .sort()

  const filteredLicenseData = Object.entries(licenseData).reduce((filtered, [packageName, info]) => {
    if (
      packageName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!licenseTypeFilter || info.licenses === licenseTypeFilter)
    ) {
      filtered[packageName] = info
    }
    return filtered
  }, {} as LicenseData)

  const licenseGroups = getLicenseGroups(filteredLicenseData)
  const groupLetters = Object.keys(licenseGroups).sort()

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gold"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md border border-danger/40 bg-danger/[0.08] p-4 text-danger">
        Error loading license data: {error}
      </div>
    )
  }

  const inputClasses =
    "w-full rounded-md border border-line-2 bg-surface-1 p-2.5 text-sm text-ink placeholder:text-ink-dim focus:border-gold focus:outline-none"

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 pb-2 sm:flex-row">
        <div className="flex-1">
          <input
            type="text"
            aria-label="Search packages"
            placeholder="Search packages..."
            className={inputClasses}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select
            aria-label="Filter by license"
            className={inputClasses}
            value={licenseTypeFilter || ""}
            onChange={(e) => setLicenseTypeFilter(e.target.value || null)}
          >
            <option value="">All licenses</option>
            {licenseTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-2 flex flex-wrap gap-2">
        <button
          className={`mono rounded-full px-3 py-1 text-xs transition-colors ${
            expandedGroup.length === 0
              ? "bg-gold text-[#1a1200]"
              : "border border-line bg-white/[0.04] text-ink-muted hover:text-ink"
          }`}
          onClick={() => setExpandedGroup([])}
        >
          Collapse all
        </button>
        {groupLetters.map((letter) => (
          <button
            key={letter}
            className={`mono rounded-full px-3 py-1 text-xs transition-colors ${
              expandedGroup.includes(letter)
                ? "bg-gold text-[#1a1200]"
                : "border border-line bg-white/[0.04] text-ink-muted hover:text-ink"
            }`}
            onClick={() =>
              setExpandedGroup(
                expandedGroup.includes(letter)
                  ? expandedGroup.filter((item) => item !== letter)
                  : [...expandedGroup, letter],
              )
            }
          >
            {letter}
          </button>
        ))}
      </div>

      {groupLetters.length === 0 ? (
        <div className="rounded-md border border-line bg-white/[0.012] p-8 text-center text-ink-muted">
          No packages found matching your criteria.
        </div>
      ) : (
        <Accordion
          type="multiple"
          value={expandedGroup}
          onValueChange={setExpandedGroup}
          className="space-y-4"
        >
          {groupLetters.map((letter) => (
            <AccordionItem
              key={letter}
              value={letter}
              className="overflow-hidden rounded-lg border border-line bg-white/[0.012]"
            >
              <AccordionTrigger className="px-4 py-3 text-ink hover:bg-white/[0.03] hover:no-underline">
                <div className="flex items-center">
                  <span className="text-xl font-bold text-gold">{letter}</span>
                  <span className="ml-2 text-sm text-ink-dim">({licenseGroups[letter].length} packages)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 p-4">
                  {licenseGroups[letter].map((packageName) => (
                    <div key={packageName} className="rounded-lg border border-line bg-white/[0.012] p-4">
                      <h3 className="text-lg font-semibold text-ink">{packageName}</h3>
                      <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-ink-muted md:grid-cols-2">
                        <div>
                          <span className="font-medium text-ink">License:</span>{" "}
                          <span className="mono rounded bg-gold-soft px-2 py-0.5 text-gold">
                            {licenseData[packageName].licenses}
                          </span>
                        </div>

                        {licenseData[packageName].publisher && (
                          <div>
                            <span className="font-medium text-ink">Publisher:</span>{" "}
                            {licenseData[packageName].publisher}
                          </div>
                        )}

                        {licenseData[packageName].repository && (
                          <div className="md:col-span-2">
                            <span className="font-medium text-ink">Repository:</span>{" "}
                            <Link
                              href={licenseData[packageName].repository!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gold hover:underline"
                            >
                              {licenseData[packageName].repository}
                            </Link>
                          </div>
                        )}

                        {licenseData[packageName].url && (
                          <div>
                            <span className="font-medium text-ink">URL:</span>{" "}
                            <Link
                              href={licenseData[packageName].url!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gold hover:underline"
                            >
                              {licenseData[packageName].url}
                            </Link>
                          </div>
                        )}

                        {licenseData[packageName].email && (
                          <div>
                            <span className="font-medium text-ink">Email:</span>{" "}
                            <a
                              href={`mailto:${licenseData[packageName].email}`}
                              className="text-gold hover:underline"
                            >
                              {licenseData[packageName].email}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <div className="mt-8 text-sm text-ink-dim">
        <p>
          This page lists all third-party packages used in the JNbot application along with their license
          information.
        </p>
      </div>
    </div>
  )
}
