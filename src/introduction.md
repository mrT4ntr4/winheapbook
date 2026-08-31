# Windows Kernel Segment Heap Notes

There is a lot to digest when it comes to windows kernel segment heap and the best way for me was to make my own diagrams and notes to understand it. I took the help from the following references. There are plenty of great resources on heap memory in Linux, but finding a single, comprehensive resource for Windows is much harder. A lot of the information is scattered across research papers, blog posts, conference talks and other sources, so I thought I'd put what I've learned together and share it with you all. It also gives me something I can come back to and use as a reference later on. These notes cover pool types, different allocators like LFH, VS, the backend segment allocator, large blocks and at last, some exploitation techniques for kernel pool overflows using named pipes.

Everything here targets Windows 10 20H2. The full source of this book is available on GitHub. Please feel free to open an issue or a PR if you find something incorrect or missing.

<p class="repo-link">
  <a href="https://github.com/mrT4ntr4/winheapbook"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg> https://github.com/mrT4ntr4/winheapbook</a>
</p>

I've tried my best to make this book self-explanatory, enough to understand how the segment heap works and just enough to learn how to exploit it. If something still doesn't make sense, you can take help from the links below.

<p class="author-line">
  <em>- mrT4ntr4</em>
  <span class="social-icons">
  <a href="https://github.com/mrT4ntr4" target="_blank" rel="noopener" title="GitHub"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg></a>
  <a href="https://x.com/MrT4ntr4" target="_blank" rel="noopener" title="Twitter/X"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg></a>
  <a href="https://www.linkedin.com/in/malhotrasuraj/" target="_blank" rel="noopener" title="LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
  </span>
</p>

### References

- [Segment Heap in Windows Kernel (Part 1)](https://speakerdeck.com/scwuaptx/windows-kernel-heap-segment-heap-in-windows-kernel-part-1) (angelboy)
- [Windows 10 Segment Heap Internals](https://blackhat.com/docs/us-16/materials/us-16-Yason-Windows-10-Segment-Heap-Internals-wp.pdf) (Yason)
- [Scoop the Windows 10 Pool](https://www.sstic.org/media/SSTIC2020/SSTIC-actes/pool_overflow_exploitation_since_windows_10_19h1/SSTIC2020-Article-pool_overflow_exploitation_since_windows_10_19h1-bayet_fariello.pdf) (Bayet, Fariello)
- [Windows Non-Paged Pool Overflow Exploitation](https://github.com/vp777/Windows-Non-Paged-Pool-Overflow-Exploitation) (vp777)
