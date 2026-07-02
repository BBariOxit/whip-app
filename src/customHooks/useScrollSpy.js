import { useState, useEffect } from 'react'

export const useScrollSpy = (sectionIds, scrollContainerRef) => {
  const [activeId, setActiveId] = useState(sectionIds[0])

  useEffect(() => {
    const scrollRoot = scrollContainerRef?.current || null

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        root: scrollRoot,
        // Sợi dây bẫy: cắt 20% trên, 79% dưới → ranh giới 1% sát trên
        rootMargin: '-20% 0px -79% 0px'
      }
    )

    sectionIds.forEach((id) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    const handleScroll = () => {
      const target = scrollContainerRef?.current
      let isAtBottom = false

      if (target) {
        isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 50
      } else {
        isAtBottom = window.innerHeight + Math.round(window.scrollY) >= document.body.offsetHeight - 50
      }

      if (isAtBottom) {
        setActiveId(sectionIds[sectionIds.length - 1])
      }
    }

    const scrollElement = scrollContainerRef?.current || window
    scrollElement.addEventListener('scroll', handleScroll)

    return () => {
      observer.disconnect()
      scrollElement.removeEventListener('scroll', handleScroll)
    }
  }, [sectionIds, scrollContainerRef])

  return activeId
}
